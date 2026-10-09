import { worlds, families } from './worlds/registry.js';
import { parseRoute, worldHash, galleryHash, neighbors } from './router.js';
import { createMotionController } from './runtime/motion.js';
import { createScope } from './runtime/scope.js';
import { renderGallery, mountGallery } from './gallery/gallery.js';
import { esc, pad } from './lib/dom.js';
import { icon } from './lib/icons.js';

const SITE_NAME = 'Website Worlds';
const TOTAL = worlds.length;

function safeStorage() {
  try {
    const storage = globalThis.localStorage;
    const probe = '__ww_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function motionButton(state) {
  const paused = state.paused;
  return `<button type="button" class="ww-hud__btn ww-motion" data-ww-motion-toggle data-state="${paused ? 'paused' : 'running'}">
      <span class="ww-motion__icon">${icon(paused ? 'play' : 'pause')}</span>
      <span class="ww-motion__label">${paused ? 'Resume motion' : 'Pause motion'}</span>
    </button>`;
}

function topbar(state) {
  return `<header class="ww-topbar">
    <a class="ww-brand" href="#/" aria-label="${SITE_NAME} — atlas home">
      <span class="ww-brand__mark" aria-hidden="true"></span>
      <span class="ww-brand__name">${SITE_NAME}</span>
    </a>
    <div class="ww-pill">${motionButton(state)}</div>
  </header>`;
}

function worldHud(world, index, prev, next, state, atlasHref = '#/') {
  return `<header class="ww-hud">
    <nav class="ww-pill ww-hud__nav" aria-label="World navigation">
      <a class="ww-hud__btn ww-hud__home" href="${esc(atlasHref)}" data-ww-nav="atlas">${icon('atlas')}<span>Atlas</span></a>
      <a class="ww-hud__btn ww-hud__step" href="${worldHash(prev.id)}" rel="prev" data-ww-nav="prev" title="Previous: ${esc(prev.label)} ( [ )">
        ${icon('prev')}<span class="ww-vh">Previous world: ${esc(prev.label)}</span>
      </a>
      <a class="ww-hud__count" href="${worldHash(world.id)}" aria-label="World ${index + 1} of ${TOTAL}: ${esc(world.label)} (permalink)">
        <span class="ww-hud__num">${pad(index + 1)}</span><span class="ww-hud__total">/${TOTAL}</span>
      </a>
      <a class="ww-hud__btn ww-hud__step" href="${worldHash(next.id)}" rel="next" data-ww-nav="next" title="Next: ${esc(next.label)} ( ] )">
        ${icon('next')}<span class="ww-vh">Next world: ${esc(next.label)}</span>
      </a>
    </nav>
    <div class="ww-pill ww-hud__tools">
      ${motionButton(state)}
      <button type="button" class="ww-hud__btn ww-share" data-ww-share>
        ${icon('link')}<span class="ww-share__label">Copy link</span>
      </button>
    </div>
  </header>`;
}

function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function startApp(app) {
  const doc = document;
  const announcer = doc.getElementById('ww-announcer');
  const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const motion = createMotionController({ storage: safeStorage(), media, doc });
  motion.connect(doc);

  let view = null;
  let token = 0;
  let firstRender = true;
  let lastWorldId = null;
  let lastGalleryHash = '#/';
  let cameFromWorld = false;
  let shareTimer = 0;
  let announceTimer = 0;

  const announce = (message) => {
    if (!announcer) return;
    announcer.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      announcer.textContent = message;
    }, 40);
  };

  function syncMotion(state) {
    const value = state.paused ? 'paused' : 'running';
    doc.documentElement.dataset.motion = value;
    doc.documentElement.dataset.pageHidden = String(state.hidden);
    app.dataset.motion = value;
    for (const button of app.querySelectorAll('[data-ww-motion-toggle]')) {
      button.dataset.state = value;
      button.querySelector('.ww-motion__icon').innerHTML = icon(state.paused ? 'play' : 'pause');
      button.querySelector('.ww-motion__label').textContent = state.paused ? 'Resume motion' : 'Pause motion';
    }
  }
  motion.subscribe(syncMotion);
  syncMotion(motion.getState());

  async function copyLink(button) {
    const url = location.href;
    let ok = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = legacyCopy(url);
    if (!button.isConnected) return;
    const label = button.querySelector('.ww-share__label');
    button.dataset.state = ok ? 'copied' : 'failed';
    label.textContent = ok ? 'Link copied' : 'Copy failed';
    announce(ok ? 'Link to this world copied to the clipboard.' : 'Could not copy automatically — the address bar holds the shareable link.');
    clearTimeout(shareTimer);
    shareTimer = setTimeout(() => {
      if (!button.isConnected) return;
      delete button.dataset.state;
      label.textContent = 'Copy link';
    }, 2400);
  }

  // Shell-level delegated handlers: registered once for the app's lifetime.
  app.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-ww-motion-toggle]')) {
      motion.toggle();
      announce(motion.getState().paused ? 'Motion paused. Scenes hold a still frame.' : 'Motion resumed.');
      return;
    }
    const share = target.closest('[data-ww-share]');
    if (share) {
      copyLink(share);
      return;
    }
    if (target.closest('[data-ww-retry]')) render();
  });

  const skip = doc.querySelector('[data-ww-skip]');
  skip?.addEventListener('click', (event) => {
    event.preventDefault();
    const main = doc.getElementById('ww-main');
    const heading = main?.querySelector('h1');
    (heading ?? main)?.focus({ preventScroll: false });
  });

  doc.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const t = event.target;
    if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"], [data-keys-captured]')) return;
    if (app.dataset.route !== 'world') return;
    if (event.key === '[' || event.key === ']') {
      const link = app.querySelector(`[data-ww-nav="${event.key === '[' ? 'prev' : 'next'}"]`);
      if (link) {
        event.preventDefault();
        location.hash = link.getAttribute('href');
      }
    }
  });

  function teardown() {
    if (view) {
      view.destroy();
      view = null;
    }
  }

  function focusTarget(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  function renderGalleryRoute(route) {
    app.dataset.route = 'gallery';
    delete app.dataset.worldId;
    delete app.dataset.worldReady;
    doc.title = `${SITE_NAME} — an atlas of ${TOTAL} animated visual worlds`;
    const state = motion.getState();
    const surprise = worlds[Math.floor(Math.random() * TOTAL)];
    app.innerHTML = `${topbar(state)}${renderGallery({ worlds, families, query: route.query, surpriseId: surprise.id })}`;
    const scope = createScope({ root: app, motion });
    view = scope;
    lastGalleryHash = galleryHash(route.query);
    mountGallery(app, scope, {
      worlds,
      query: route.query,
      focusId: cameFromWorld ? lastWorldId : null,
      onQueryChange: (hash) => {
        lastGalleryHash = hash;
      },
    });
    if (!cameFromWorld) window.scrollTo(0, 0);
    if (!firstRender && !cameFromWorld) focusTarget(app.querySelector('h1'));
  }

  function renderNotFound(route) {
    app.dataset.route = 'not-found';
    delete app.dataset.worldId;
    delete app.dataset.worldReady;
    doc.title = `Uncharted — ${SITE_NAME}`;
    const random = worlds[Math.floor(Math.random() * TOTAL)];
    app.innerHTML = `${topbar(motion.getState())}
      <main id="ww-main" class="ww-missing" tabindex="-1">
        <p class="ww-missing__code">404 · uncharted territory</p>
        <h1>This world isn't on the map</h1>
        <p>There is no world at <code>${esc(route.path)}</code>. The atlas holds ${TOTAL} worlds — pick up the trail here:</p>
        <ul class="ww-missing__links">
          <li><a class="ww-btn ww-btn--primary" href="#/">${icon('atlas')} Back to the atlas</a></li>
          <li><a class="ww-btn" href="${worldHash(random.id)}">${icon('compass')} Visit ${esc(random.label)}</a></li>
        </ul>
      </main>`;
    window.scrollTo(0, 0);
    focusTarget(app.querySelector('h1'));
  }

  function renderLoadError(world) {
    const main = app.querySelector('#ww-main');
    if (!main) return;
    main.innerHTML = `<div class="ww-missing ww-missing--inline">
        <p class="ww-missing__code">Signal lost</p>
        <h1>${esc(world.label)} could not be opened</h1>
        <p>The world's files did not load — possibly a dropped connection.</p>
        <ul class="ww-missing__links">
          <li><button type="button" class="ww-btn ww-btn--primary" data-ww-retry>Try again</button></li>
          <li><a class="ww-btn" href="#/">${icon('atlas')} Back to the atlas</a></li>
        </ul>
      </div>`;
    app.dataset.worldReady = 'error';
    app.removeAttribute('aria-busy');
    focusTarget(main.querySelector('h1'));
  }

  async function renderWorldRoute(route, myToken) {
    const { world, index } = route;
    const { prev, next } = neighbors(index, TOTAL);
    lastWorldId = world.id;
    app.dataset.route = 'world';
    app.dataset.worldId = world.id;
    app.dataset.worldReady = 'false';
    app.setAttribute('aria-busy', 'true');
    doc.title = `${world.label} — ${SITE_NAME}`;
    app.innerHTML = `${worldHud(world, index, worlds[prev], worlds[next], motion.getState(), lastGalleryHash)}
      <main id="ww-main" class="ww-stage" style="--accent:${world.accent}">
        <div class="ww-loading" role="status">
          <span class="ww-loading__ring" aria-hidden="true"></span>
          <p>Opening <strong>${esc(world.label)}</strong>…</p>
        </div>
      </main>`;
    window.scrollTo(0, 0);

    let mod;
    try {
      mod = await world.renderer();
    } catch (error) {
      if (myToken !== token) return;
      globalThis.console?.error?.(error);
      renderLoadError(world);
      return;
    }
    if (myToken !== token) return;

    const main = app.querySelector('#ww-main');
    const section = doc.createElement('section');
    section.className = `ww-world w-${world.id}`;
    section.dataset.world = world.id;
    section.innerHTML = mod.render({ world, index, total: TOTAL });
    const heading = section.querySelector('h1');
    if (heading) {
      heading.id = 'ww-world-title';
      heading.tabIndex = -1;
      section.setAttribute('aria-labelledby', 'ww-world-title');
    }
    main.replaceChildren(section);

    const scope = createScope({ root: section, motion, world });
    view = scope;
    try {
      const cleanup = mod.mount(section, scope);
      if (typeof cleanup === 'function') scope.onCleanup(cleanup);
    } catch (error) {
      globalThis.console?.error?.(error);
      section.insertAdjacentHTML(
        'beforeend',
        '<p class="ww-world-error" role="alert">This world hit a snag starting its animation, so a still scene is shown.</p>',
      );
    }
    app.dataset.worldReady = 'true';
    app.removeAttribute('aria-busy');
    if (!firstRender) focusTarget(heading ?? main);
  }

  async function render() {
    const route = parseRoute(location.hash, worlds, families);
    const myToken = ++token;
    if (route.redirect) history.replaceState(null, '', route.redirect);
    const wasWorld = app.dataset.route === 'world';
    teardown();
    cameFromWorld = wasWorld && route.name === 'gallery';
    if (route.name === 'world') await renderWorldRoute(route, myToken);
    else if (route.name === 'gallery') renderGalleryRoute(route);
    else renderNotFound(route);
    if (myToken === token) {
      app.removeAttribute('aria-busy');
      syncMotion(motion.getState());
      firstRender = false;
    }
  }

  window.addEventListener('hashchange', render);
  render();
}
