import './scrapbook.css';
import { esc } from '../lib/dom.js';
import { createRng, randomSeed } from '../lib/random.js';

const TAPES = [
  { id: 'dots', name: 'polka dots' },
  { id: 'stripes', name: 'candy stripes' },
  { id: 'grid', name: 'graph grid' },
];

const LETTER_STYLES = ['a', 'b', 'c', 'd', 'e'];

function tornPolygon(rng, teeth = 16, depth = 3) {
  const top = [];
  const bottom = [];
  for (let i = 0; i <= teeth; i++) {
    const x = (i / teeth) * 100;
    top.push(`${x.toFixed(1)}% ${rng.range(0, depth).toFixed(1)}%`);
    bottom.push(`${(100 - x).toFixed(1)}% ${(100 - rng.range(0, depth)).toFixed(1)}%`);
  }
  return `polygon(${top.concat(bottom).join(',')})`;
}

const SEASIDE = `<svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
  <defs><linearGradient id="w-scrap-sea-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c58f"/><stop offset="1" stop-color="#f3e2c4"/></linearGradient></defs>
  <rect width="200" height="160" fill="url(#w-scrap-sea-sky)"/>
  <circle cx="132" cy="72" r="22" fill="#f2884b"/>
  <rect y="86" width="200" height="74" fill="#3f7f8f"/>
  <path d="M0 96h200M0 108h200M0 122h200" stroke="#9fcbd2" stroke-width="2" stroke-dasharray="14 10" opacity=".7"/>
  <path d="M0 160V132c22-10 40-6 56 2s30 12 46 4v22z" fill="#5b4636"/>
  <path d="M58 52q6-6 12 0q6-6 12 0" stroke="#3b2a1e" stroke-width="2" fill="none"/>
</svg>`;

const TRAIL = `<svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
  <rect width="200" height="160" fill="#cfe3e8"/>
  <path d="M0 110L46 52l30 34 34-48 44 54 46-30v98H0z" fill="#7d95a0"/>
  <path d="M110 38l12 14-6-2-6 8-6-8-6 2z" fill="#f4f7f8"/>
  <path d="M0 160V118c40-8 70 2 104-6s64-4 96 0v48z" fill="#5f7d4a"/>
  <path d="M96 160c4-18 10-30 28-48" stroke="#e8d3a8" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g fill="#2f4a2a"><path d="M30 132l10-30 10 30z"/><path d="M44 138l9-24 9 24z"/><path d="M160 128l9-26 9 26z"/></g>
</svg>`;

const FLOWER = `<svg viewBox="0 0 120 150" aria-hidden="true" focusable="false">
  <path d="M60 146C58 110 64 84 58 50" stroke="#6c7d4a" stroke-width="2.4" fill="none"/>
  <path d="M60 110c-16-4-26-16-28-28 14 2 24 12 28 28zM59 92c14-6 26-4 34 4-12 6-24 6-34-4z" fill="#8a9a5b" opacity=".85"/>
  <g fill="#e9a3b4" opacity=".9"><ellipse cx="58" cy="30" rx="9" ry="16"/><ellipse cx="58" cy="30" rx="9" ry="16" transform="rotate(72 58 46)"/><ellipse cx="58" cy="30" rx="9" ry="16" transform="rotate(144 58 46)"/><ellipse cx="58" cy="30" rx="9" ry="16" transform="rotate(216 58 46)"/><ellipse cx="58" cy="30" rx="9" ry="16" transform="rotate(288 58 46)"/></g>
  <circle cx="58" cy="46" r="7" fill="#e3b04b"/>
</svg>`;

export function render({ world }) {
  const letters = Array.from(world.label)
    .map((ch, i) => `<span class="w-scrap__letter w-scrap__letter--${LETTER_STYLES[i % LETTER_STYLES.length]}" style="--lr:${((i * 37) % 13) - 6}deg">${esc(ch)}</span>`)
    .join('');

  return `
  <svg class="w-scrap__doodles" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M60 640l14-30 14 30-30-18h32z" />
    <path d="M920 120c-20 30-60 40-90 20" />
    <path d="M832 132l-4 14 14-2" />
    <path d="M940 600c10-14 30-14 34 2s-20 22-30 10" />
  </svg>
  <div class="w-scrap__board">
    <div class="w-scrap__piece w-scrap__title" data-scrap style="--r:-2deg">
      <span class="w-scrap__tape w-scrap__tape--tl" aria-hidden="true"></span>
      <div class="w-scrap__paper w-scrap__torn w-scrap__lined">
        <p class="w-scrap__date">Sat · 14 Sept · page 39</p>
        <h1 class="w-scrap__h1"><span class="ww-vh">${esc(world.label)}</span><span class="w-scrap__letters" aria-hidden="true">${letters}</span></h1>
        <p class="ww-caption w-scrap__caption">${esc(world.description)}</p>
      </div>
    </div>

    <figure class="w-scrap__piece w-scrap__polaroid w-scrap__sway" data-scrap style="--r:4deg">
      <span class="w-scrap__tape w-scrap__tape--top" aria-hidden="true"></span>
      ${SEASIDE}
      <figcaption>tide pools, low sun ☼</figcaption>
    </figure>

    <figure class="w-scrap__piece w-scrap__polaroid w-scrap__polaroid--b w-scrap__sway" data-scrap style="--r:-5deg">
      <span class="w-scrap__tape w-scrap__tape--top" aria-hidden="true"></span>
      ${TRAIL}
      <figcaption>the long way up</figcaption>
    </figure>

    <div class="w-scrap__piece w-scrap__note-wrap" data-scrap style="--r:3deg">
      <span class="w-scrap__pin" aria-hidden="true"></span>
      <div class="w-scrap__note" data-side="front">
        <div class="w-scrap__face w-scrap__face--front">
          <p class="w-scrap__note-label">note to self —</p>
          <p class="w-scrap__note-text">keep the ticket stub. keep the sand in the shoes a little longer.</p>
          <p class="w-scrap__note-hint">(turn over →)</p>
        </div>
        <div class="w-scrap__face w-scrap__face--back">
          <p class="w-scrap__note-label">p.s.</p>
          <p class="w-scrap__note-text">the lanterns were brighter than any of the photos. trust the memory.</p>
          <p class="w-scrap__note-hint">(← front)</p>
        </div>
      </div>
    </div>

    <div class="w-scrap__piece w-scrap__ticket w-scrap__sway" data-scrap style="--r:-3deg" aria-hidden="true">
      <span class="w-scrap__ticket-main"><strong>ADMIT ONE</strong><span>Lantern Night · Harbour Steps</span><span>Row F · Seat 12</span></span>
      <span class="w-scrap__ticket-stub">No.<br>0412</span>
    </div>

    <div class="w-scrap__piece w-scrap__flower" data-scrap style="--r:6deg" aria-hidden="true">
      <span class="w-scrap__tape w-scrap__tape--diag" aria-hidden="true"></span>
      ${FLOWER}
      <span class="w-scrap__flower-label">pressed · sea campion</span>
    </div>

    <div class="w-scrap__piece w-scrap__sticky" data-scrap style="--r:-6deg" aria-hidden="true">
      <span>don't forget the film for next time!</span>
    </div>

    <div class="w-scrap__piece w-scrap__ctrl" data-scrap style="--r:-1deg">
      <div class="w-scrap__controls" role="group" aria-label="Scrapbook controls">
        <button type="button" class="w-scrap__tag" data-world-action="flip" aria-pressed="false">Flip the note</button>
        <button type="button" class="w-scrap__tag" data-world-action="shuffle">Reshuffle scraps</button>
        <button type="button" class="w-scrap__tag" data-world-action="tape">Tape: <span data-value>polka dots</span></button>
      </div>
      <p class="w-scrap__status" data-world-status role="status">Note front · layout 1 · polka dot tape</p>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const pieces = Array.from(root.querySelectorAll('[data-scrap]'));
  const note = root.querySelector('.w-scrap__note');
  const state = { side: 'front', layout: 1, tape: 0 };

  const tornRng = createRng(14);
  for (const el of root.querySelectorAll('.w-scrap__torn')) el.style.clipPath = tornPolygon(tornRng);

  function sync() {
    root.dataset.tape = TAPES[state.tape].id;
    note.dataset.side = state.side;
    root.querySelector('[data-world-action="tape"] [data-value]').textContent = TAPES[state.tape].name;
    ctx.status(`Note ${state.side === 'front' ? 'front side' : 'back side'} · layout ${state.layout} · ${TAPES[state.tape].name} tape`);
  }

  ctx.actions({
    flip(button) {
      state.side = state.side === 'front' ? 'back' : 'front';
      button.setAttribute('aria-pressed', String(state.side === 'back'));
      sync();
    },
    shuffle() {
      const rng = createRng(randomSeed());
      const order = pieces.map((_, i) => i).sort(() => rng.next() - 0.5);
      pieces.forEach((piece, i) => {
        piece.style.setProperty('--r', `${rng.range(-7, 7).toFixed(1)}deg`);
        piece.style.setProperty('--dx', `${Math.round(rng.range(-16, 16))}px`);
        piece.style.setProperty('--dy', `${Math.round(rng.range(-14, 14))}px`);
        piece.style.setProperty('--z', String(order[i] + 1));
      });
      state.layout += 1;
      sync();
    },
    tape() {
      state.tape = (state.tape + 1) % TAPES.length;
      sync();
    },
  });

  sync();
}
