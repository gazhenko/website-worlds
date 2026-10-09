import './kinetic-type.css';
import { esc } from '../lib/dom.js';
import { approach, smoothstep, TAU } from '../lib/math.js';
import { snoise2 } from '../lib/noise.js';

const PHRASES = ['MOVE EVERY LETTER', 'TYPE IS MOTION', 'READ THE RHYTHM', 'LOUD SOFT LOUD'];
const CHOREOS = [
  { id: 'wave', name: 'Wave' },
  { id: 'orbit', name: 'Orbit' },
  { id: 'stack', name: 'Stack' },
  { id: 'scatter', name: 'Scatter' },
];
const TEMPOS = [
  { name: 'Andante', k: 1 },
  { name: 'Allegro', k: 2.2 },
];

function phraseMarkup(phrase) {
  let i = 0;
  return phrase
    .split(' ')
    .map(
      (word, w) =>
        `<span class="w-kin__word" data-w="${w}">${Array.from(word)
          .map((ch) => `<span class="w-kin__ch" data-i="${i++}" data-w="${w}">${esc(ch)}</span>`)
          .join('')}</span>`,
    )
    .join(' ');
}

export function render({ world }) {
  return `
  <div class="w-kin__stage" data-stage aria-hidden="true">
    <div class="w-kin__phrase" data-phrase>${phraseMarkup(PHRASES[0])}</div>
  </div>
  <p class="ww-vh" data-phrase-text>Current phrase: ${esc(PHRASES[0].toLowerCase())}</p>
  <header class="w-kin__head">
    <h1 class="w-kin__title">${esc(world.label)}</h1>
    <p class="w-kin__meta">Score Nº 28 · for letters and pointer</p>
  </header>
  <div class="w-kin__panel">
    <p class="ww-caption w-kin__caption">${esc(world.description)}</p>
    <div class="w-kin__controls" role="group" aria-label="Choreography controls">
      <button type="button" data-world-action="choreo">Choreography: <span data-value>Wave</span></button>
      <button type="button" data-world-action="phrase">Next phrase</button>
      <button type="button" data-world-action="tempo">Tempo: <span data-tempo>Andante</span></button>
    </div>
    <p class="w-kin__status" data-world-status role="status">Wave · “move every letter” · andante</p>
  </div>`;
}

export function mount(root, ctx) {
  const stage = root.querySelector('[data-stage]');
  const phraseEl = root.querySelector('[data-phrase]');
  const phraseText = root.querySelector('[data-phrase-text]');
  const state = { choreo: 0, phrase: 0, tempo: 0 };
  const pointer = { x: -9999, y: -9999, active: 0 };
  let letters = [];
  let stageW = 0;
  let stageH = 0;
  let clock = 0;

  // Measure each letter's resting ("home") centre with transforms cleared.
  function measure() {
    const chars = Array.from(phraseEl.querySelectorAll('.w-kin__ch'));
    for (const el of chars) el.style.transform = 'none';
    const rect = stage.getBoundingClientRect();
    stageW = rect.width;
    stageH = rect.height;
    letters = chars.map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        i,
        w: Number(el.dataset.w),
        hx: r.left - rect.left + r.width / 2,
        hy: r.top - rect.top + r.height / 2,
        size: r.height,
        tx: 0,
        ty: 0,
        rot: 0,
        sx: 1,
        sy: 1,
      };
    });
  }

  function sync() {
    root.dataset.choreo = CHOREOS[state.choreo].id;
    root.querySelector('[data-world-action="choreo"] [data-value]').textContent = CHOREOS[state.choreo].name;
    root.querySelector('[data-tempo]').textContent = TEMPOS[state.tempo].name;
    phraseText.textContent = `Current phrase: ${PHRASES[state.phrase].toLowerCase()}`;
    ctx.status(`${CHOREOS[state.choreo].name} · “${PHRASES[state.phrase].toLowerCase()}” · ${TEMPOS[state.tempo].name.toLowerCase()}`);
  }

  ctx.actions({
    choreo() {
      state.choreo = (state.choreo + 1) % CHOREOS.length;
      sync();
    },
    phrase() {
      state.phrase = (state.phrase + 1) % PHRASES.length;
      phraseEl.innerHTML = phraseMarkup(PHRASES[state.phrase]);
      measure();
      sync();
    },
    tempo() {
      state.tempo = (state.tempo + 1) % TEMPOS.length;
      sync();
    },
  });

  ctx.on(root, 'pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = 1.5;
  });
  ctx.on(root, 'pointerleave', () => {
    pointer.active = 0;
  });

  ctx.onResize(stage, () => {
    measure();
    ctx.redraw();
  });
  measure();

  function target(l, n, t, choreo) {
    const phase = t * 2.2 - l.i * 0.38;
    switch (choreo) {
      case 'orbit': {
        const a = (l.i / n) * TAU + t * 0.45 - Math.PI / 2;
        const R = Math.min(stageW, stageH) * 0.36;
        const x = stageW / 2 + Math.cos(a) * R;
        const y = stageH / 2 + Math.sin(a) * R * 0.85;
        return { tx: x - l.hx, ty: y - l.hy, rot: (a * 180) / Math.PI + 90, sx: 0.62, sy: 0.62 };
      }
      case 'stack': {
        const slide = Math.sin(t * 1.1 + l.w * 2.1) * stageW * 0.1;
        return { tx: slide, ty: 0, rot: 0, sx: 1 + 0.42 * Math.sin(t * 2 + l.i * 0.7), sy: 1 + 0.3 * Math.sin(t * 2 + l.i * 0.7 + Math.PI) };
      }
      case 'scatter': {
        const k = smoothstep(0.15, 0.85, (Math.sin(t * 0.55) + 1) / 2);
        return {
          tx: snoise2(l.i * 1.7, t * 0.15) * stageW * 0.36 * k,
          ty: snoise2(l.i * 2.3 + 40, t * 0.15) * stageH * 0.34 * k,
          rot: snoise2(l.i * 0.9 + 9, t * 0.2) * 200 * k,
          sx: 1,
          sy: 1,
        };
      }
      default:
        return { tx: 0, ty: Math.sin(phase) * l.size * 0.22, rot: Math.sin(phase + 1) * 6, sx: 1, sy: 1 + 0.28 * Math.sin(phase + 1.2) };
    }
  }

  ctx.loop(({ dt, running }) => {
    if (!letters.length) return;
    clock += dt * TEMPOS[state.tempo].k;
    pointer.active = Math.max(0, pointer.active - dt);
    const choreo = CHOREOS[state.choreo].id;
    const t = running ? clock : 0.9;
    const n = letters.length;
    for (const l of letters) {
      const goal = target(l, n, t, choreo);
      if (!running && choreo === 'scatter') {
        goal.tx *= 0.3;
        goal.ty *= 0.3;
        goal.rot *= 0.3;
      }
      if (pointer.active > 0 && running) {
        const dx = l.hx + goal.tx - pointer.x;
        const dy = l.hy + goal.ty - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const push = Math.max(0, 150 - d) * 0.55;
        goal.tx += (dx / d) * push;
        goal.ty += (dy / d) * push;
      }
      const rate = running ? 6 : 1000;
      const step = running ? dt : 1;
      l.tx = approach(l.tx, goal.tx, rate, step);
      l.ty = approach(l.ty, goal.ty, rate, step);
      l.rot = approach(l.rot, goal.rot, rate, step);
      l.sx = approach(l.sx, goal.sx, rate, step);
      l.sy = approach(l.sy, goal.sy, rate, step);
      l.el.style.transform = `translate(${l.tx.toFixed(1)}px, ${l.ty.toFixed(1)}px) rotate(${l.rot.toFixed(1)}deg) scale(${l.sx.toFixed(3)}, ${l.sy.toFixed(3)})`;
    }
  });

  sync();
}
