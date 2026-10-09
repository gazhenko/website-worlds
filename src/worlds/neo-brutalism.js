import './neo-brutalism.css';
import { esc } from '../lib/dom.js';
import { createRng } from '../lib/random.js';

const WORDS = ['HI!', 'OK', 'ZAP', 'WOW', '★', '→', 'YES', 'BIG', 'POP', '#1', 'NEW', 'RAW'];
const COLORS = ['#ffd23f', '#ff7eb6', '#3a86ff', '#3ddc97', '#ff9f1c', '#b8a1ff', '#ffffff'];
const STAMPS = ['APPROVED', 'LOUD', '100% RAW', 'NO RULES'];
const MAX_BLOCKS = 12;
const GRAVITY = 2600;
const GRID = 8;
const snap = (v) => Math.round(v / GRID) * GRID;

export function render({ world }) {
  const band = 'BLOCKS ★ BOLD ★ BORDERS ★ HARD SHADOWS ★ NO GRADIENTS ★ ';
  return `
  <div class="w-brut__layout">
    <header class="w-brut__head">
      <p class="w-brut__issue">Issue 03 · No rules · All blocks</p>
      <h1 class="w-brut__title">${esc(world.label)}</h1>
      <span class="w-brut__sticker" aria-hidden="true">LOUD<br>&amp; CLEAR</span>
      <span class="w-brut__stamp" data-stamp hidden aria-hidden="true"></span>
    </header>
    <div class="w-brut__side">
      <p class="ww-caption w-brut__caption">${esc(world.description)}</p>
      <div class="w-brut__controls" role="group" aria-label="Scene controls">
        <button type="button" class="w-brut__btn" data-world-action="drop" style="--c:#ffd23f">Drop block ↓</button>
        <button type="button" class="w-brut__btn" data-world-action="shake" style="--c:#ff7eb6">Shake pile</button>
        <button type="button" class="w-brut__btn" data-world-action="stamp" style="--c:#3ddc97">Stamp it</button>
      </div>
      <p class="w-brut__status" data-world-status role="status">Pit: 3 of ${MAX_BLOCKS} blocks · no stamp</p>
    </div>
    <div class="w-brut__pit-wrap">
      <div class="w-brut__pit-head" aria-hidden="true"><span>THE PIT</span><span data-count>3/${MAX_BLOCKS}</span></div>
      <div class="w-brut__pit" aria-hidden="true"></div>
    </div>
  </div>
  <div class="w-brut__marquee" aria-hidden="true"><div class="w-brut__track"><span>${band}${band}</span><span>${band}${band}</span></div></div>`;
}

export function mount(root, ctx) {
  const pit = root.querySelector('.w-brut__pit');
  const countEl = root.querySelector('[data-count]');
  const stampEl = root.querySelector('[data-stamp]');
  const rng = createRng(303);
  const blocks = [];
  let W = 0;
  let H = 0;
  let wordIndex = 0;
  let stampIndex = -1;
  let crunched = false;

  const overlapsX = (a, b) => a.x < b.x + b.w - 4 && a.x + a.w > b.x + 4;

  function makeBlock() {
    const w = snap(rng.range(72, Math.max(88, Math.min(150, W * 0.36))));
    const h = snap(rng.range(44, 76));
    const x = snap(rng.range(0, Math.max(0, W - w)));
    const el = document.createElement('div');
    el.className = 'w-brut__block';
    el.textContent = WORDS[wordIndex % WORDS.length];
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.setProperty('--c', COLORS[(wordIndex * 3) % COLORS.length]);
    wordIndex += 1;
    pit.append(el);
    const rotTarget = rng.pick([-6, -3, 0, 0, 3, 6]);
    const block = { el, x, y: -h - 40, w, h, vy: 0, rot: rotTarget * 2, rotTarget, settled: false };
    blocks.push(block);
    return block;
  }

  const byBottom = () => blocks.slice().sort((a, b) => b.y + b.h - (a.y + a.h));

  // Instant, motion-free placement used while paused or reduced-motion is on.
  function settleAll() {
    const placed = [];
    for (const b of byBottom()) {
      let surface = H;
      for (const o of placed) if (overlapsX(b, o)) surface = Math.min(surface, o.y);
      b.y = surface - b.h;
      b.vy = 0;
      b.settled = true;
      b.rot = b.rotTarget;
      placed.push(b);
    }
  }

  function step(dt) {
    for (const b of byBottom()) {
      const prevBottom = b.y + b.h;
      let surface = H;
      for (const o of blocks) {
        if (o !== b && overlapsX(b, o) && o.y >= prevBottom - 2) surface = Math.min(surface, o.y);
      }
      if (b.settled) {
        if (surface - prevBottom > 1) b.settled = false;
        else {
          b.y = surface - b.h;
          continue;
        }
      }
      b.vy = Math.min(b.vy + GRAVITY * dt, 2400);
      b.y += b.vy * dt;
      if (b.y + b.h >= surface) {
        b.y = surface - b.h;
        if (b.vy > 420) {
          b.vy = -b.vy * 0.28;
          b.rot = -b.rotTarget;
        } else {
          b.vy = 0;
          b.settled = true;
          b.rot = b.rotTarget;
        }
      }
    }
  }

  function draw() {
    for (const b of blocks) {
      b.el.style.transform = `translate(${b.x}px, ${b.y.toFixed(1)}px) rotate(${b.rot}deg)`;
    }
  }

  function sync() {
    countEl.textContent = `${blocks.length}/${MAX_BLOCKS}`;
    const stamp = stampIndex >= 0 ? `stamp: ${STAMPS[stampIndex]}` : 'no stamp';
    const crunch = crunched ? ' · pit crunched flat' : '';
    ctx.status(`Pit: ${blocks.length} of ${MAX_BLOCKS} blocks${crunch} · ${stamp}`);
  }

  function measure() {
    const w = pit.clientWidth;
    const h = pit.clientHeight;
    if (w === W && h === H) return;
    W = w;
    H = h;
    for (const b of blocks) {
      b.x = Math.min(b.x, Math.max(0, W - b.w));
      b.settled = false;
    }
    if (!ctx.running) settleAll();
    draw();
    ctx.redraw();
  }

  ctx.actions({
    drop() {
      crunched = false;
      if (blocks.length >= MAX_BLOCKS) {
        for (const b of blocks) b.el.remove();
        blocks.length = 0;
        crunched = true;
      }
      makeBlock();
      if (!ctx.running) settleAll();
      draw();
      sync();
    },
    shake() {
      for (const b of blocks) {
        b.settled = false;
        b.vy = -980;
        b.x = Math.min(Math.max(0, b.x + snap(rng.range(-48, 48))), Math.max(0, W - b.w));
        b.rotTarget = rng.pick([-6, -3, 0, 3, 6]);
        b.rot = -b.rotTarget * 2;
      }
      if (!ctx.running) settleAll();
      draw();
      sync();
    },
    stamp() {
      stampIndex = stampIndex + 1 >= STAMPS.length ? -1 : stampIndex + 1;
      if (stampIndex === -1) {
        stampEl.hidden = true;
      } else {
        stampEl.textContent = STAMPS[stampIndex];
        stampEl.hidden = false;
        stampEl.classList.remove('is-slam');
        void stampEl.offsetWidth;
        stampEl.classList.add('is-slam');
      }
      sync();
    },
  });

  ctx.onResize(pit, measure);
  measure();
  for (let i = 0; i < 3; i++) makeBlock();
  settleAll();
  draw();
  sync();

  ctx.onMotion(
    (state) => {
      if (!state.running) {
        settleAll();
        draw();
      }
    },
    { immediate: false },
  );

  ctx.loop(({ dt, running }) => {
    if (!running || dt === 0) return;
    if (blocks.some((b) => !b.settled)) {
      step(dt);
      draw();
    }
  });
}
