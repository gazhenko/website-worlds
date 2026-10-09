import './bento-grid.css';
import { esc } from '../lib/dom.js';
import { TAU } from '../lib/math.js';

const TILE_NAMES = {
  intro: 'Intro',
  clock: 'Clock',
  weather: 'Weather',
  chart: 'Chart',
  route: 'Route map',
  steps: 'Step counter',
  palette: 'Palette',
  quote: 'Quote',
  breathe: 'Breathing guide',
};
const LAYOUTS = [
  { name: 'A', tiles: [['intro', 2, 2], ['clock', 1, 1], ['weather', 1, 2], ['chart', 1, 1], ['route', 2, 1], ['steps', 1, 1], ['palette', 1, 1], ['quote', 2, 1], ['breathe', 1, 1]] },
  { name: 'B', tiles: [['weather', 2, 1], ['intro', 2, 2], ['chart', 2, 1], ['clock', 1, 1], ['steps', 1, 1], ['route', 2, 2], ['quote', 1, 1], ['palette', 1, 1], ['breathe', 2, 1]] },
  { name: 'C', tiles: [['intro', 2, 2], ['route', 2, 2], ['quote', 2, 1], ['clock', 1, 1], ['weather', 1, 1], ['chart', 1, 2], ['steps', 1, 1], ['breathe', 1, 1], ['palette', 1, 1]] },
];
const FEATURABLE = ['weather', 'chart', 'route', 'clock', 'steps', 'quote', 'palette', 'breathe'];
const QUOTES = [
  ['Small boxes, big days.', 'Tilde Marsh, packed-lunch philosopher'],
  ['Every grid wants one surprise.', 'Notebook of the Harbour Studio'],
  ['Leave a little rice for tomorrow.', 'Overheard at the canteen'],
  ['Order is a kind of calm.', 'Ivo Rennick, tile setter'],
];

function tile(id, inner, extra = '') {
  return `<article class="w-bento__tile w-bento__tile--${id}" data-tile="${id}" ${extra}>${inner}</article>`;
}

export function render({ world }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TAU;
    return `<line x1="${(50 + Math.sin(a) * 40).toFixed(1)}" y1="${(50 - Math.cos(a) * 40).toFixed(1)}" x2="${(50 + Math.sin(a) * 45).toFixed(1)}" y2="${(50 - Math.cos(a) * 45).toFixed(1)}"/>`;
  }).join('');
  const bars = Array.from({ length: 7 }, (_, i) => `<span style="--h:${[40, 65, 52, 80, 45, 70, 58][i]}%"><i>${'MTWTFSS'[i]}</i></span>`).join('');

  return `
  <div class="w-bento__tray">
    ${tile(
      'intro',
      `<p class="w-bento__eyebrow">Tray 09 · nine compartments</p>
      <h1 class="w-bento__title">${esc(world.label)}</h1>
      <p class="ww-caption w-bento__caption">${esc(world.description)}</p>
      <div class="w-bento__controls" role="group" aria-label="Grid controls">
        <button type="button" data-world-action="shuffle">Reshuffle · <span data-value>A</span></button>
        <button type="button" data-world-action="feature">Feature: <span data-feature-name>Weather</span></button>
        <button type="button" data-world-action="theme" aria-pressed="false">Dark tray</button>
      </div>
      <p class="w-bento__status" data-world-status role="status">Layout A · featured tile: Weather · light tray</p>`,
    )}
    ${tile(
      'clock',
      `<p class="w-bento__label">Studio time</p>
      <svg class="w-bento__clock" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="47" class="w-bento__clock-face"/>
        <g class="w-bento__clock-ticks">${ticks}</g>
        <line x1="50" y1="50" x2="50" y2="26" class="w-bento__hand w-bento__hand--h" data-hand="h"/>
        <line x1="50" y1="50" x2="50" y2="16" class="w-bento__hand w-bento__hand--m" data-hand="m"/>
        <line x1="50" y1="56" x2="50" y2="12" class="w-bento__hand w-bento__hand--s" data-hand="s"/>
        <circle cx="50" cy="50" r="3" class="w-bento__pin"/>
      </svg>
      <p class="w-bento__digital" data-digital aria-hidden="true">--:--</p>`,
      'aria-hidden="true"',
    )}
    ${tile(
      'weather',
      `<p class="w-bento__label">Harbour Nine</p>
      <svg class="w-bento__weather" viewBox="0 0 120 90" aria-hidden="true">
        <g class="w-bento__rays"><circle cx="46" cy="38" r="16" class="w-bento__sun"/>${Array.from({ length: 8 }, (_, i) => `<rect x="44.5" y="6" width="3" height="10" rx="1.5" transform="rotate(${i * 45} 46 38)" class="w-bento__ray"/>`).join('')}</g>
        <path class="w-bento__cloud" d="M40 70c0-10 8-16 17-14 3-8 12-12 20-8 8-2 16 4 16 12 7 0 11 5 11 10H40z"/>
        <path class="w-bento__cloud w-bento__cloud--b" d="M6 58c0-6 5-10 11-9 2-5 8-7 13-5 5-1 10 3 10 8 4 0 7 3 7 6H6z"/>
      </svg>
      <p class="w-bento__big">18°</p><p class="w-bento__sub">Breezy · gusts 22 km/h</p>`,
      'aria-hidden="true"',
    )}
    ${tile('chart', `<p class="w-bento__label">Focus hours</p><div class="w-bento__bars" data-bars>${bars}</div>`, 'aria-hidden="true"')}
    ${tile(
      'route',
      `<p class="w-bento__label">Route 7 · 2.4 km</p>
      <svg class="w-bento__map" viewBox="0 0 220 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="w-bento__blocks"><rect x="8" y="8" width="40" height="30" rx="4"/><rect x="58" y="8" width="54" height="30" rx="4"/><rect x="122" y="8" width="40" height="44" rx="4"/><rect x="172" y="8" width="40" height="30" rx="4"/><rect x="8" y="48" width="58" height="54" rx="4"/><rect x="76" y="48" width="36" height="54" rx="4"/><rect x="172" y="48" width="40" height="54" rx="4"/><rect x="122" y="62" width="40" height="40" rx="4"/></g>
        <path class="w-bento__river" d="M-10 96C40 80 70 106 120 92S190 60 230 70"/>
        <path class="w-bento__route" data-route d="M28 43H71V58H117V43H167V58H192V100"/>
        <circle r="5" class="w-bento__dot" data-dot cx="28" cy="43"/>
      </svg>`,
      'aria-hidden="true"',
    )}
    ${tile(
      'steps',
      `<p class="w-bento__label">Steps today</p>
      <svg class="w-bento__ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32" class="w-bento__ring-bg"/><circle cx="40" cy="40" r="32" class="w-bento__ring-fg" data-ring pathLength="100"/></svg>
      <p class="w-bento__count" data-steps>8,412</p>`,
      'aria-hidden="true"',
    )}
    ${tile(
      'palette',
      `<p class="w-bento__label">Glaze palette</p><div class="w-bento__swatches"><span></span><span></span><span></span><span></span></div>`,
      'aria-hidden="true"',
    )}
    ${tile(
      'quote',
      `<p class="w-bento__label">Daily line</p><blockquote class="w-bento__quote" data-quote><p>“${QUOTES[0][0]}”</p><footer>— ${QUOTES[0][1]}</footer></blockquote>`,
      'aria-hidden="true"',
    )}
    ${tile('breathe', `<p class="w-bento__label">Breathe · 4 in · 4 out</p><span class="w-bento__breath"></span>`, 'aria-hidden="true"')}
  </div>`;
}

export function mount(root, ctx) {
  const tray = root.querySelector('.w-bento__tray');
  const tiles = new Map(Array.from(root.querySelectorAll('[data-tile]')).map((el) => [el.dataset.tile, el]));
  const hands = { h: root.querySelector('[data-hand="h"]'), m: root.querySelector('[data-hand="m"]'), s: root.querySelector('[data-hand="s"]') };
  const digital = root.querySelector('[data-digital]');
  const barEls = Array.from(root.querySelectorAll('[data-bars] span'));
  const route = root.querySelector('[data-route]');
  const dot = root.querySelector('[data-dot]');
  const ring = root.querySelector('[data-ring]');
  const stepsEl = root.querySelector('[data-steps]');
  const quoteEl = root.querySelector('[data-quote]');
  const state = { layout: 0, feature: 0, dark: false, quote: 0 };
  let routeLength = 0;
  let steps = 8412;
  let elapsed = 0;

  try {
    routeLength = route.getTotalLength();
  } catch {
    routeLength = 0;
  }

  function applyLayout() {
    const featured = FEATURABLE[state.feature];
    LAYOUTS[state.layout].tiles.forEach(([id, cs, rs], i) => {
      const el = tiles.get(id);
      const isFeatured = id === featured;
      el.style.order = String(i);
      el.style.setProperty('--cs', String(isFeatured ? 2 : cs));
      el.style.setProperty('--rs', String(isFeatured ? 2 : rs));
      el.classList.toggle('is-featured', isFeatured);
    });
  }

  function flip(change) {
    const els = Array.from(tiles.values());
    const before = els.map((el) => el.getBoundingClientRect());
    change();
    if (!ctx.running) return;
    els.forEach((el, i) => {
      const after = el.getBoundingClientRect();
      const dx = before[i].left - after.left;
      const dy = before[i].top - after.top;
      const sx = before[i].width / Math.max(1, after.width);
      const sy = before[i].height / Math.max(1, after.height);
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
      if (typeof el.animate !== 'function') return;
      el.animate(
        [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }],
        { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    });
  }

  function sync() {
    root.dataset.theme = state.dark ? 'dark' : 'light';
    const featured = FEATURABLE[state.feature];
    root.querySelector('[data-world-action="shuffle"] [data-value]').textContent = LAYOUTS[state.layout].name;
    root.querySelector('[data-feature-name]').textContent = TILE_NAMES[featured];
    ctx.status(`Layout ${LAYOUTS[state.layout].name} · featured tile: ${TILE_NAMES[featured]} · ${state.dark ? 'dark' : 'light'} tray`);
  }

  ctx.actions({
    shuffle() {
      flip(() => {
        state.layout = (state.layout + 1) % LAYOUTS.length;
        applyLayout();
      });
      sync();
    },
    feature() {
      flip(() => {
        state.feature = (state.feature + 1) % FEATURABLE.length;
        applyLayout();
      });
      sync();
    },
    theme(button) {
      state.dark = !state.dark;
      button.setAttribute('aria-pressed', String(state.dark));
      sync();
    },
  });

  ctx.every(2200, () => {
    for (const bar of barEls) bar.style.setProperty('--h', `${Math.round(25 + Math.random() * 70)}%`);
  });

  ctx.every(6500, () => {
    state.quote = (state.quote + 1) % QUOTES.length;
    const [line, who] = QUOTES[state.quote];
    quoteEl.classList.remove('is-in');
    void quoteEl.offsetWidth;
    quoteEl.innerHTML = `<p>“${line}”</p><footer>— ${who}</footer>`;
    quoteEl.classList.add('is-in');
  });

  ctx.loop(({ dt }) => {
    elapsed += dt;
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;
    hands.h.setAttribute('transform', `rotate(${(hr * 30).toFixed(2)} 50 50)`);
    hands.m.setAttribute('transform', `rotate(${(min * 6).toFixed(2)} 50 50)`);
    hands.s.setAttribute('transform', `rotate(${(sec * 6).toFixed(2)} 50 50)`);
    digital.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (routeLength) {
      const s = ((elapsed * 0.09) % 1) * routeLength;
      const p = route.getPointAtLength(s);
      dot.setAttribute('cx', p.x.toFixed(1));
      dot.setAttribute('cy', p.y.toFixed(1));
    }

    steps += dt * 2.4;
    stepsEl.textContent = Math.floor(steps).toLocaleString('en-GB');
    ring.style.strokeDashoffset = String(100 - Math.min(100, (steps / 10000) * 100));
  });

  applyLayout();
  sync();
}
