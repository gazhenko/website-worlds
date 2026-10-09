import './glassmorphism.css';
import { esc } from '../lib/dom.js';
import { clamp } from '../lib/math.js';

const FROSTS = [
  { id: 'clear', name: 'Clear', px: 6 },
  { id: 'frosted', name: 'Frosted', px: 18 },
  { id: 'opal', name: 'Opal', px: 34 },
];
const TINTS = [
  { id: 'aurora', name: 'Aurora' },
  { id: 'citrus', name: 'Citrus' },
  { id: 'lagoon', name: 'Lagoon' },
];
const ANCHORS = [
  { x: 0.74, y: 0.32, name: 'upper right' },
  { x: 0.84, y: 0.72, name: 'lower right' },
  { x: 0.46, y: 0.8, name: 'lower middle' },
  { x: 0.58, y: 0.5, name: 'centre' },
];
const ORBS = [
  { a: 0.11, b: 0.07, p: 0, q: 1.2, s: 0.62 },
  { a: 0.08, b: 0.12, p: 2.1, q: 0.4, s: 0.54 },
  { a: 0.13, b: 0.09, p: 4.2, q: 2.6, s: 0.48 },
  { a: 0.06, b: 0.1, p: 1.3, q: 3.9, s: 0.7 },
  { a: 0.1, b: 0.05, p: 5.1, q: 5.3, s: 0.4 },
];
const LENS = 156;

const orbsMarkup = () => ORBS.map((_, i) => `<span class="w-glass__orb w-glass__orb--${i}" data-orb></span>`).join('');

export function render({ world }) {
  return `
  <div class="w-glass__field" aria-hidden="true">${orbsMarkup()}</div>
  <div class="w-glass__layout">
    <article class="w-glass__pane w-glass__main">
      <p class="w-glass__kicker">Pane 01 · refractive layer</p>
      <h1 class="w-glass__title">${esc(world.label)}</h1>
      <p class="ww-caption w-glass__caption">${esc(world.description)}</p>
      <div class="w-glass__controls" role="group" aria-label="Glass controls">
        <button type="button" class="w-glass__btn" data-world-action="frost">Frost: <span data-value>Frosted</span></button>
        <button type="button" class="w-glass__btn" data-world-action="tint">Tint: <span data-tint-name>Aurora</span></button>
      </div>
      <p class="w-glass__status" data-world-status role="status">Frosted glass · Aurora tint · lens at upper right</p>
    </article>
    <aside class="w-glass__pane w-glass__weather" aria-hidden="true">
      <span class="w-glass__sun"></span>
      <p class="w-glass__big">21°</p>
      <p>Lumen Bay · clear spells</p>
    </aside>
    <aside class="w-glass__pane w-glass__now" aria-hidden="true">
      <p class="w-glass__small">Now drifting</p>
      <p class="w-glass__song">Refraction (slow version)</p>
      <span class="w-glass__bar"><span></span></span>
    </aside>
  </div>
  <button type="button" class="w-glass__lens" data-world-action="lens" aria-label="Move the magnifying lens. Drag it, or focus it and use the arrow keys." data-keys-captured>
    <span class="w-glass__lens-field" aria-hidden="true">${orbsMarkup()}</span>
    <span class="w-glass__lens-shine" aria-hidden="true"></span>
  </button>`;
}

export function mount(root, ctx) {
  const lens = root.querySelector('.w-glass__lens');
  const lensField = root.querySelector('.w-glass__lens-field');
  const orbs = Array.from(root.querySelectorAll('.w-glass__field [data-orb]'));
  const lensOrbs = Array.from(lensField.querySelectorAll('[data-orb]'));
  const state = { frost: 1, tint: 0, anchor: 0, custom: false };
  const size = { w: 0, h: 0 };
  const lensPos = { x: 0, y: 0 };
  let drag = null;
  let suppressClick = false;

  const lensSize = () => lens.offsetWidth || LENS;

  function placeLens(x, y) {
    const ls = lensSize();
    lensPos.x = clamp(x, 0, Math.max(0, size.w - ls));
    lensPos.y = clamp(y, 0, Math.max(0, size.h - ls));
    lens.style.transform = `translate(${lensPos.x.toFixed(1)}px, ${lensPos.y.toFixed(1)}px)`;
    lensField.style.width = `${size.w}px`;
    lensField.style.height = `${size.h}px`;
    lensField.style.left = `${-lensPos.x}px`;
    lensField.style.top = `${-lensPos.y}px`;
    lensField.style.transformOrigin = `${(lensPos.x + ls / 2).toFixed(1)}px ${(lensPos.y + ls / 2).toFixed(1)}px`;
  }

  function placeAtAnchor() {
    const a = ANCHORS[state.anchor];
    const ls = lensSize();
    placeLens(a.x * size.w - ls / 2, a.y * size.h - ls / 2);
  }

  function measure() {
    const rect = root.getBoundingClientRect();
    size.w = rect.width;
    size.h = rect.height;
    const d = Math.max(size.w, size.h);
    ORBS.forEach((o, i) => {
      const px = `${(d * o.s).toFixed(0)}px`;
      orbs[i].style.width = orbs[i].style.height = px;
      lensOrbs[i].style.width = lensOrbs[i].style.height = px;
    });
    if (state.custom) placeLens(lensPos.x, lensPos.y);
    else placeAtAnchor();
    ctx.redraw();
  }

  function sync() {
    const frost = FROSTS[state.frost];
    root.dataset.tint = TINTS[state.tint].id;
    root.style.setProperty('--frost', `${frost.px}px`);
    root.querySelector('[data-world-action="frost"] [data-value]').textContent = frost.name;
    root.querySelector('[data-tint-name]').textContent = TINTS[state.tint].name;
    const where = state.custom ? 'where you placed it' : `at ${ANCHORS[state.anchor].name}`;
    ctx.status(`${frost.name} glass (${frost.px}px blur) · ${TINTS[state.tint].name} tint · lens ${where}`);
  }

  ctx.actions({
    frost() {
      state.frost = (state.frost + 1) % FROSTS.length;
      sync();
    },
    tint() {
      state.tint = (state.tint + 1) % TINTS.length;
      sync();
    },
    lens() {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      state.custom = false;
      state.anchor = (state.anchor + 1) % ANCHORS.length;
      placeAtAnchor();
      sync();
    },
  });

  ctx.on(lens, 'pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, x: lensPos.x, y: lensPos.y, moved: false };
    lens.setPointerCapture?.(event.pointerId);
  });
  ctx.on(lens, 'pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.sx;
    const dy = event.clientY - drag.sy;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    if (drag.moved) {
      state.custom = true;
      placeLens(drag.x + dx, drag.y + dy);
    }
  });
  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
      suppressClick = true;
      sync();
      ctx.after(400, () => {
        suppressClick = false;
      });
    }
    drag = null;
  };
  ctx.on(lens, 'pointerup', endDrag);
  ctx.on(lens, 'pointercancel', endDrag);
  ctx.on(lens, 'keydown', (event) => {
    const step = event.shiftKey ? 64 : 24;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    state.custom = true;
    placeLens(lensPos.x + move[0], lensPos.y + move[1]);
    sync();
  });

  ctx.onResize(root, measure);
  measure();

  ctx.loop(({ time }) => {
    const base = Math.max(size.w, size.h);
    ORBS.forEach((o, i) => {
      const d = base * o.s;
      const x = size.w * (0.5 + 0.4 * Math.sin(time * o.a * 2 + o.p)) - d / 2;
      const y = size.h * (0.5 + 0.38 * Math.cos(time * o.b * 2 + o.q)) - d / 2;
      const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      orbs[i].style.transform = t;
      lensOrbs[i].style.transform = t;
    });
  });

  sync();
}
