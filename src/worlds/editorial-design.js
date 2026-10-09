import './editorial-design.css';
import { esc } from '../lib/dom.js';

const STORIES = [
  {
    kicker: 'Field notes · Coast',
    headline: 'The Quiet Engineering of Tides',
    deck: "In the harbour town of Lumen Bay, a guild of clockmakers keeps time by the sea — and the sea, it turns out, keeps time by them.",
    byline: 'Words by Ines Calder · Drawings by the Studio',
    body: [
      'Every morning before the gulls, Odile Varga walks the length of the east pier with a brass key on a ribbon. She winds nine tide clocks along the way, each one set into the stone at the height the water reached on the day its maker retired. It is, she admits, a sentimental system. It is also accurate to within four minutes.',
      "The clocks do not tell the hour. They tell the sea's mood: how far it has to go, how quickly it is going there, whether it means to stay. Fishermen read them the way commuters read a departures board, with a glance and a muttered verdict.",
      "What keeps the guild going is not nostalgia but attention. “A tide is a slow sentence,” Varga says, pausing by the seventh clock. “You have to stay for the whole thing before you know what it meant.”",
    ],
    pull: 'A tide is a slow sentence. You have to stay for the whole thing.',
    figure: 'Fig. 1 — The seventh clock on the east pier, drawn at low water.',
    art: 'tide',
  },
  {
    kicker: 'Natural history',
    headline: 'Notes From a Night Garden',
    deck: 'Moonflowers open at dusk, moths arrive on schedule, and one gardener keeps a ledger of everything that happens after nine.',
    byline: 'Words by Tomas Elling · Drawings by the Studio',
    body: [
      'Halvard Mire plants nothing that blooms before sunset. His garden, behind a terrace of narrow houses, is white and silver by design: evening primrose, tobacco flowers, a moonflower vine he coaxes up a drainpipe every spring.',
      'At nine o’clock he sits with a lantern turned low and writes down who visits. The ledger now runs to eleven volumes. It records the hawk-moths by their timing, a hedgehog he calls the Inspector, and one night of unexplained applause from next door.',
      '“People think a garden sleeps,” he says, closing the eleventh volume on a pressed petal. “It just changes staff.”',
    ],
    pull: 'People think a garden sleeps. It just changes staff.',
    figure: 'Fig. 2 — Moonflower, primrose and visitor, sketched by lantern light.',
    art: 'garden',
  },
  {
    kicker: 'City',
    headline: 'A Field Guide to Small Weather',
    deck: 'Courtyards, stairwells and bus shelters each have a climate of their own. A group of volunteers is mapping them, one thermometer at a time.',
    byline: 'Words by Ruth Okafor-Lind · Charts by the Studio',
    body: [
      'The courtyard behind the old print works is, by the group’s measurements, two degrees warmer than the street outside and markedly less windy. It has its own fog on autumn mornings. It has, according to one volunteer, its own sense of humour.',
      'The Small Weather Society began with a single thermometer taped inside a bus shelter. It now keeps sixty-one stations across the city, logged by hand into notebooks that are photocopied and pinned to a noticeboard in the library.',
      'Their maps are beautiful and slightly absurd: isobars around a fountain, a front moving through a car park. “Big weather gets the forecasts,” says the founder. “Small weather is where people actually stand.”',
    ],
    pull: 'Big weather gets the forecasts. Small weather is where people actually stand.',
    figure: 'Fig. 3 — Isobars of the print-works courtyard, 7 a.m., October.',
    art: 'weather',
  },
];
const COLUMN_NAMES = { 1: 'one column', 2: 'two columns', 3: 'three columns' };

const ART = {
  tide: `<svg viewBox="0 0 240 200" aria-hidden="true" focusable="false">
    <rect width="240" height="200" fill="#e9dfcc"/>
    <path d="M0 140c20-8 40-8 60 0s40 8 60 0 40-8 60 0 40 8 60 0v60H0z" fill="#1a1714"/>
    <path d="M0 160c20-8 40-8 60 0s40 8 60 0 40-8 60 0 40 8 60 0" fill="none" stroke="#e9dfcc" stroke-width="2"/>
    <rect x="96" y="44" width="48" height="104" fill="#f6f1e7" stroke="#1a1714" stroke-width="2"/>
    <circle cx="120" cy="76" r="18" fill="#f6f1e7" stroke="#1a1714" stroke-width="2"/>
    <path class="w-ed__hand" d="M120 76V62" stroke="#c8321e" stroke-width="3" stroke-linecap="round"/>
    <path d="M104 110h32M104 120h32M104 130h32" stroke="#1a1714" stroke-width="1.5"/>
    <circle cx="190" cy="40" r="14" fill="#c8321e"/>
  </svg>`,
  garden: `<svg viewBox="0 0 240 200" aria-hidden="true" focusable="false">
    <rect width="240" height="200" fill="#1a1714"/>
    <circle cx="186" cy="44" r="22" fill="#f6f1e7"/>
    <circle cx="196" cy="38" r="20" fill="#1a1714"/>
    <g stroke="#f6f1e7" stroke-width="2" fill="none"><path d="M60 200c4-40 10-70 30-100"/><path d="M120 200c-2-50 6-80 0-120"/><path d="M180 200c-6-36-20-60-36-84"/></g>
    <g fill="#f6f1e7"><circle cx="90" cy="100" r="14"/><circle cx="120" cy="80" r="16"/><circle cx="144" cy="116" r="12"/></g>
    <g fill="#c8321e"><circle cx="90" cy="100" r="4"/><circle cx="120" cy="80" r="5"/><circle cx="144" cy="116" r="3.5"/></g>
    <path class="w-ed__moth" d="M58 50c-10-10-24-6-22 4 2 8 14 8 22-4zm0 0c10-10 24-6 22 4-2 8-14 8-22-4z" fill="#e9dfcc"/>
  </svg>`,
  weather: `<svg viewBox="0 0 240 200" aria-hidden="true" focusable="false">
    <rect width="240" height="200" fill="#e9dfcc"/>
    <g fill="none" stroke="#1a1714" stroke-width="1.6">
      <ellipse cx="120" cy="104" rx="30" ry="22"/><ellipse cx="120" cy="104" rx="56" ry="42"/><ellipse cx="120" cy="104" rx="86" ry="64"/><ellipse cx="120" cy="104" rx="118" ry="88"/>
    </g>
    <circle cx="120" cy="104" r="10" fill="#c8321e"/>
    <path class="w-ed__front" d="M20 40c30 10 50 40 60 80" fill="none" stroke="#c8321e" stroke-width="3"/>
    <g fill="#c8321e"><path d="M30 44l8-8 2 11z"/><path d="M52 62l9-6v11z"/><path d="M68 86l10-4-3 11z"/></g>
    <text x="150" y="40" font-family="Georgia, serif" font-size="12" fill="#1a1714">1014</text>
  </svg>`,
};

const words = (text) =>
  text
    .split(' ')
    .map((w, i) => `<span class="w-ed__word" style="--i:${i}">${esc(w)}</span>`)
    .join(' ');

function storyMarkup(story) {
  return {
    kicker: esc(story.kicker),
    headline: words(story.headline),
    deck: esc(story.deck),
    byline: esc(story.byline),
    body: story.body.map((p, i) => `<p class="w-ed__para" style="--p:${i}">${esc(p)}</p>`).join(''),
    pull: esc(story.pull),
    figure: esc(story.figure),
    art: ART[story.art],
  };
}

export function render({ world }) {
  const s = storyMarkup(STORIES[0]);
  return `
  <div class="w-ed__spread" data-cols="2">
    <div class="w-ed__progress" aria-hidden="true"><span></span></div>
    <header class="w-ed__masthead">
      <p class="w-ed__mast">Folio <span>&amp;</span> Field</p>
      <h1 class="w-ed__h1">${esc(world.label)}</h1>
      <p class="w-ed__issue">Issue 14 · Autumn · <span data-folio>p. 39</span></p>
    </header>
    <p class="ww-caption w-ed__caption">${esc(world.description)}</p>
    <div class="w-ed__pages" data-pages>
      <section class="w-ed__page w-ed__page--left">
        <p class="w-ed__kicker" data-slot="kicker">${s.kicker}</p>
        <h2 class="w-ed__headline" data-slot="headline">${s.headline}</h2>
        <p class="w-ed__deck" data-slot="deck">${s.deck}</p>
        <p class="w-ed__byline" data-slot="byline">${s.byline}</p>
        <figure class="w-ed__figure">
          <div class="w-ed__art" data-slot="art">${s.art}</div>
          <figcaption data-slot="figure">${s.figure}</figcaption>
        </figure>
      </section>
      <section class="w-ed__page w-ed__page--right" aria-label="Article text">
        <div class="w-ed__body" data-slot="body">${s.body}</div>
        <blockquote class="w-ed__pull" data-slot="pull">${s.pull}</blockquote>
        <div class="w-ed__tools">
          <div class="w-ed__controls" role="group" aria-label="Spread controls">
            <button type="button" data-world-action="story">Next story →</button>
            <button type="button" data-world-action="columns">Columns: <span data-value>2</span></button>
            <button type="button" data-world-action="grid" aria-pressed="false">Baseline grid</button>
          </div>
          <p class="w-ed__status" data-world-status role="status">Story 1 of 3 · two columns · baseline grid hidden</p>
        </div>
      </section>
    </div>
    <div class="w-ed__ticker" aria-hidden="true"><div><span>Coast · Natural history · City · Letters · Recipes for rain · Crossword · Coast · Natural history · City · Letters · Recipes for rain · Crossword · </span><span>Coast · Natural history · City · Letters · Recipes for rain · Crossword · Coast · Natural history · City · Letters · Recipes for rain · Crossword · </span></div></div>
  </div>`;
}

export function mount(root, ctx) {
  const spread = root.querySelector('.w-ed__spread');
  const pages = root.querySelector('[data-pages]');
  const slot = (name) => root.querySelector(`[data-slot="${name}"]`);
  const state = { story: 0, cols: 2, grid: false };

  function sync() {
    spread.dataset.cols = String(state.cols);
    spread.dataset.grid = String(state.grid);
    root.querySelector('[data-world-action="columns"] [data-value]').textContent = String(state.cols);
    root.querySelector('[data-folio]').textContent = `p. ${39 + state.story * 6}`;
    const narrow = state.cols === 3 && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 600px)').matches;
    const cols = narrow ? 'three columns (two on this narrow screen)' : COLUMN_NAMES[state.cols];
    ctx.status(
      `Story ${state.story + 1} of ${STORIES.length}: “${STORIES[state.story].headline}” · ${cols} · baseline grid ${state.grid ? 'shown' : 'hidden'}`,
    );
  }

  ctx.actions({
    story() {
      state.story = (state.story + 1) % STORIES.length;
      const s = storyMarkup(STORIES[state.story]);
      for (const key of Object.keys(s)) slot(key).innerHTML = s[key];
      pages.classList.remove('is-turning');
      void pages.offsetWidth;
      pages.classList.add('is-turning');
      sync();
    },
    columns() {
      state.cols = (state.cols % 3) + 1;
      sync();
    },
    grid(button) {
      state.grid = !state.grid;
      button.setAttribute('aria-pressed', String(state.grid));
      sync();
    },
  });

  pages.classList.add('is-turning');
  sync();
}
