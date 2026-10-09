import './y2k-aesthetic.css';
import { esc } from '../lib/dom.js';
import { approach } from '../lib/math.js';

const SKINS = [
  { id: 'bubblegum', name: 'Bubblegum' },
  { id: 'ice', name: 'Ice' },
  { id: 'lime', name: 'Lime' },
];
const TRACKS = ['Starlight Modem', 'Dial-Up Daydream', 'Hyperlink Heart', 'Silver Screen Saver'];
const EQ_BARS = 14;
const MAX_SPARKLES = 40;

const star = (x, y, s, cls = '') =>
  `<path class="w-y2k__star ${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0 -50C6 -12 12 -6 50 0C12 6 6 12 0 50C-6 12 -12 6 -50 0C-12 -6 -6 -12 0 -50Z"/>`;

export function render({ world }) {
  const bars = Array.from({ length: EQ_BARS }, (_, i) => `<span style="--i:${i}"></span>`).join('');
  return `
  <div class="w-y2k__bg" aria-hidden="true">
    <svg class="w-y2k__chrome" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="w-y2k-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset=".34" stop-color="#d4dbe6"/><stop offset=".5" stop-color="#5f6c82"/>
          <stop offset=".58" stop-color="#eef3fa"/><stop offset=".82" stop-color="#97a3b6"/><stop offset="1" stop-color="#ffffff"/>
        </linearGradient>
        <radialGradient id="w-y2k-orb" cx=".35" cy=".3" r=".75">
          <stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#e3e9f2"/><stop offset=".7" stop-color="#8090a8"/><stop offset="1" stop-color="#d8e0ec"/>
        </radialGradient>
      </defs>
      <g class="w-y2k__float w-y2k__float--a">${star(140, 150, 1.4)}</g>
      <g class="w-y2k__float w-y2k__float--b">${star(1060, 120, 0.9)}</g>
      <g class="w-y2k__float w-y2k__float--c">${star(1010, 660, 1.6)}</g>
      <g class="w-y2k__float w-y2k__float--b">${star(90, 640, 0.7)}</g>
      <g class="w-y2k__float w-y2k__float--a"><circle cx="900" cy="330" r="46" fill="url(#w-y2k-orb)"/></g>
      <g class="w-y2k__float w-y2k__float--c"><circle cx="300" cy="420" r="26" fill="url(#w-y2k-orb)"/></g>
      <g class="w-y2k__float w-y2k__float--b"><path d="M560 60c40-30 110-10 120 30s-40 50-70 40-90-40-50-70z" fill="url(#w-y2k-chrome)" stroke="#6d7a8f" stroke-width="2"/></g>
    </svg>
  </div>
  <div class="w-y2k__layout">
    <header class="w-y2k__head">
      <p class="w-y2k__kicker">★ welcome to the future ★ build 2.0.0.0</p>
      <h1 class="w-y2k__title">${esc(world.label)}</h1>
      <p class="ww-caption w-y2k__caption">${esc(world.description)}</p>
    </header>
    <section class="w-y2k__player" aria-label="Orbit Player 2000">
      <div class="w-y2k__titlebar"><span class="w-y2k__lights" aria-hidden="true"><i></i><i></i><i></i></span><span>Orbit Player 2000</span></div>
      <div class="w-y2k__deck">
        <div class="w-y2k__disc-wrap" aria-hidden="true">
          <div class="w-y2k__disc" data-disc><span class="w-y2k__disc-shine"></span></div>
          <span class="w-y2k__disc-hub"></span>
        </div>
        <div class="w-y2k__info">
          <p class="w-y2k__track"><span class="w-y2k__track-no" data-track-no>TRACK 01</span> <span data-track-name>${TRACKS[0]}</span></p>
          <div class="w-y2k__eq" aria-hidden="true">${bars}</div>
          <div class="w-y2k__progress" aria-hidden="true"><span data-progress></span></div>
          <div class="w-y2k__controls" role="group" aria-label="Player controls">
            <button type="button" class="w-y2k__gel" data-world-action="spin" aria-pressed="true"><span data-value>❚❚ Stop disc</span></button>
            <button type="button" class="w-y2k__gel" data-world-action="skin">Skin: <span data-skin-name>Bubblegum</span></button>
            <button type="button" class="w-y2k__gel" data-world-action="sparkle">✦ Sparkle</button>
          </div>
          <p class="w-y2k__status" data-world-status role="status">Disc spinning · Bubblegum skin</p>
        </div>
      </div>
    </section>
  </div>
  <div class="w-y2k__sparkles" aria-hidden="true"></div>`;
}

export function mount(root, ctx) {
  const disc = root.querySelector('[data-disc]');
  const bars = Array.from(root.querySelectorAll('.w-y2k__eq span'));
  const progress = root.querySelector('[data-progress]');
  const trackNo = root.querySelector('[data-track-no]');
  const trackName = root.querySelector('[data-track-name]');
  const sparkleLayer = root.querySelector('.w-y2k__sparkles');
  const state = { playing: true, skin: 0, track: 0, sparkles: 0 };
  const heights = bars.map(() => 0.3);
  let angle = 0;
  let speed = 0;
  let played = 0.18;

  function sync() {
    root.dataset.skin = SKINS[state.skin].id;
    root.dataset.playing = String(state.playing);
    root.querySelector('[data-skin-name]').textContent = SKINS[state.skin].name;
    const spin = root.querySelector('[data-world-action="spin"]');
    spin.setAttribute('aria-pressed', String(state.playing));
    spin.querySelector('[data-value]').textContent = state.playing ? '❚❚ Stop disc' : '▶ Play disc';
    trackNo.textContent = `TRACK ${String(state.track + 1).padStart(2, '0')}`;
    trackName.textContent = TRACKS[state.track];
    const sparkle = state.sparkles ? ` · ${state.sparkles} sparkle bursts` : '';
    ctx.status(`Disc ${state.playing ? 'spinning' : 'stopped'} · ${SKINS[state.skin].name} skin · ${TRACKS[state.track]}${sparkle}`);
  }

  function burst() {
    const existing = sparkleLayer.childElementCount;
    const count = Math.min(12, MAX_SPARKLES - existing);
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'w-y2k__sparkle';
      s.style.left = `${(8 + Math.random() * 84).toFixed(1)}%`;
      s.style.top = `${(10 + Math.random() * 80).toFixed(1)}%`;
      s.style.setProperty('--size', `${Math.round(14 + Math.random() * 30)}px`);
      s.style.setProperty('--delay', `${(Math.random() * 0.4).toFixed(2)}s`);
      s.style.setProperty('--hue', String(Math.round(Math.random() * 360)));
      sparkleLayer.append(s);
      ctx.after(ctx.running ? 1900 : 3200, () => s.remove());
    }
  }

  ctx.actions({
    spin() {
      state.playing = !state.playing;
      sync();
    },
    skin() {
      state.skin = (state.skin + 1) % SKINS.length;
      sync();
    },
    sparkle() {
      burst();
      state.sparkles += 1;
      sync();
    },
  });

  ctx.loop(({ dt, time }) => {
    speed = approach(speed, state.playing ? 160 : 0, 2.2, dt);
    angle = (angle + speed * dt) % 360;
    disc.style.transform = `rotate(${angle.toFixed(2)}deg)`;

    if (state.playing && dt > 0) {
      played += dt / 75;
      if (played >= 1) {
        played = 0;
        state.track = (state.track + 1) % TRACKS.length;
        sync();
      }
    }
    progress.style.transform = `scaleX(${played.toFixed(4)})`;

    bars.forEach((bar, i) => {
      const target = state.playing
        ? 0.18 + 0.82 * Math.abs(Math.sin(time * (2.1 + (i % 5) * 0.7) + i * 0.9) * Math.cos(time * 0.9 + i * 0.3))
        : 0.1;
      heights[i] = dt ? approach(heights[i], target, 12, dt) : target;
      bar.style.transform = `scaleY(${heights[i].toFixed(3)})`;
    });
  });

  sync();
}
