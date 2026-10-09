import { esc, pad } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { worldHash, galleryHash } from '../router.js';
import { filterWorlds } from './filter.js';
import { thumbFor } from './thumbs.js';

const REPO_URL = 'https://github.com/gazhenko/website-worlds';

export function renderGallery({ worlds, families, query = { q: '', family: 'all' }, surpriseId }) {
  const total = worlds.length;
  const familyName = (id) => families.find((f) => f.id === id)?.label ?? id;

  const tiles = worlds
    .map(
      (w, i) =>
        `<span class="ww-portal__tile" style="--i:${i};--c:${w.accent}"><span>${pad(i + 1)}</span></span>`,
    )
    .join('');

  const chips = [{ id: 'all', label: 'All worlds' }, ...families]
    .map((f) => {
      const count = f.id === 'all' ? total : worlds.filter((w) => w.family === f.id).length;
      return `<button type="button" class="ww-chip" data-ww-family="${f.id}" aria-pressed="${query.family === f.id}">
          ${esc(f.label)}<span class="ww-chip__count" aria-hidden="true">${count}</span>
        </button>`;
    })
    .join('');

  const cards = worlds
    .map(
      (w, i) => `
      <li class="ww-card" data-ww-card="${w.id}" data-family="${w.family}" style="--accent:${w.accent}">
        <div class="ww-card__art" aria-hidden="true">${thumbFor(w.id)}</div>
        <div class="ww-card__body">
          <p class="ww-card__meta"><span class="ww-card__num">${pad(i + 1)}</span><span>${esc(familyName(w.family))}</span></p>
          <h3 class="ww-card__title"><a class="ww-card__link" href="${worldHash(w.id)}">${esc(w.label)}</a></h3>
          <p class="ww-card__tagline">${esc(w.tagline)}</p>
        </div>
      </li>`,
    )
    .join('');

  return `
  <main id="ww-main" class="ww-gallery">
    <section class="ww-hero" aria-labelledby="ww-title">
      <div class="ww-portal" aria-hidden="true">
        <div class="ww-portal__halo"></div>
        <div class="ww-portal__stage"><div class="ww-portal__ring">${tiles}</div></div>
      </div>
      <div class="ww-hero__copy">
        <p class="ww-hero__kicker">An explorable atlas · ${total} worlds</p>
        <h1 id="ww-title" class="ww-hero__title"><span>Website</span><span>Worlds</span></h1>
        <p class="ww-hero__lede">${total} hand-built scenes, each with its own type, geometry and motion. Step into any of them, press its controls, and share a link straight to it.</p>
        <div class="ww-hero__ctas">
          <a class="ww-btn ww-btn--primary" href="${worldHash(worlds[0].id)}">Enter world 01 ${icon('arrow')}</a>
          <a class="ww-btn" href="${worldHash(surpriseId)}">${icon('shuffle')} Surprise me</a>
          <button type="button" class="ww-btn ww-btn--ghost" data-ww-jump>Browse the atlas</button>
        </div>
        <ul class="ww-hero__facts" aria-label="About this atlas">
          <li>CSS · SVG · Canvas</li><li>No trackers or remote assets</li><li>Pause motion anytime</li>
        </ul>
      </div>
    </section>

    <section id="ww-atlas" class="ww-atlas" aria-labelledby="ww-atlas-title">
      <div class="ww-atlas__head">
        <h2 id="ww-atlas-title">The atlas</h2>
        <p class="ww-atlas__count" data-ww-count role="status" aria-live="polite">All ${total} worlds</p>
      </div>
      <form class="ww-filters" role="search" data-ww-filters>
        <div class="ww-search">
          <label for="ww-search" class="ww-search__label">Search worlds</label>
          <span class="ww-search__field">
            ${icon('search')}
            <input id="ww-search" type="search" name="q" autocomplete="off" spellcheck="false" maxlength="80"
              placeholder="Try “neon”, “paper” or “3d”" value="${esc(query.q)}" />
          </span>
        </div>
        <div class="ww-chips" role="group" aria-label="Filter by family">${chips}</div>
      </form>
      <ol class="ww-grid" data-ww-grid>${cards}</ol>
      <div class="ww-empty" data-ww-empty hidden>
        <p>No world matches that search.</p>
        <button type="button" class="ww-btn" data-ww-clear>Clear search and filters</button>
      </div>
    </section>

    <footer class="ww-footer">
      <p><strong>Website Worlds</strong> is a demo atlas. Every scene is drawn procedurally with CSS, SVG and Canvas from code in this repository; all names and copy are fictional. System fonts only, no remote assets, no tracking, no audio.</p>
      <p>Keyboard: <kbd>[</kbd> and <kbd>]</kbd> step between worlds. The Pause motion control freezes every animation and is remembered between visits.</p>
      <p><a href="${REPO_URL}" rel="noopener noreferrer">Source on GitHub — gazhenko/website-worlds</a></p>
    </footer>
  </main>`;
}

export function mountGallery(root, scope, { worlds, query = { q: '', family: 'all' }, focusId = null, onQueryChange } = {}) {
  const input = root.querySelector('#ww-search');
  const form = root.querySelector('[data-ww-filters]');
  const chips = Array.from(root.querySelectorAll('[data-ww-family]'));
  const cards = new Map(Array.from(root.querySelectorAll('[data-ww-card]')).map((li) => [li.dataset.wwCard, li]));
  const count = root.querySelector('[data-ww-count]');
  const empty = root.querySelector('[data-ww-empty]');
  const state = { q: query.q ?? '', family: query.family ?? 'all' };

  function apply({ updateUrl = true } = {}) {
    const visible = new Set(filterWorlds(worlds, state).map((w) => w.id));
    for (const [id, li] of cards) li.hidden = !visible.has(id);
    for (const chip of chips) chip.setAttribute('aria-pressed', String(chip.dataset.wwFamily === state.family));
    const n = visible.size;
    const text = n === worlds.length ? `All ${worlds.length} worlds` : `${n} of ${worlds.length} worlds`;
    if (count.textContent !== text) count.textContent = text;
    empty.hidden = n > 0;
    const hash = galleryHash(state);
    onQueryChange?.(hash);
    if (updateUrl && location.hash !== hash && !(hash === '#/' && location.hash === '')) {
      history.replaceState(null, '', hash);
    }
  }

  scope.on(form, 'submit', (event) => event.preventDefault());
  scope.on(input, 'input', () => {
    state.q = input.value;
    apply();
  });
  for (const chip of chips) {
    scope.on(chip, 'click', () => {
      state.family = chip.dataset.wwFamily;
      apply();
    });
  }
  scope.on(root.querySelector('[data-ww-clear]'), 'click', () => {
    state.q = '';
    state.family = 'all';
    input.value = '';
    apply();
    input.focus();
  });
  scope.on(root.querySelector('[data-ww-jump]'), 'click', (event) => {
    event.preventDefault();
    const atlas = root.querySelector('#ww-atlas');
    atlas?.scrollIntoView({ behavior: scope.running ? 'smooth' : 'auto', block: 'start' });
    input.focus({ preventScroll: true });
  });

  apply({ updateUrl: false });

  if (focusId && cards.has(focusId)) {
    const li = cards.get(focusId);
    if (!li.hidden) {
      li.scrollIntoView({ block: 'center' });
      li.querySelector('a')?.focus({ preventScroll: true });
    }
  }
}
