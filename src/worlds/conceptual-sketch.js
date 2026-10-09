import './conceptual-sketch.css';
import { esc } from '../lib/dom.js';
import { clamp } from '../lib/math.js';
import { circlePath } from '../lib/svg.js';

const ellipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

const CONCEPTS = [
  {
    name: 'Lamp',
    rev: 'A',
    guides: ['M60 470H740', 'M330 60V520', circlePath(300, 300, 18), circlePath(500, 200, 16), 'M560 262L470 470', 'M626 284L700 470', 'M240 512H420M240 504v16M420 504v16'],
    lines: [
      ellipse(330, 470, 90, 22),
      'M240 470v14a90 22 0 0 0 180 0v-14',
      'M322 462L292 306M338 462L308 306',
      'M300 292L496 194M308 308L504 210',
      'M488 190L532 176L622 270Q600 306 548 312Z',
      'M548 312Q596 300 622 270',
      'M560 300q16 22 40 6',
    ],
    details: [
      'M316 440l12-8-10-10 12-8-10-10 12-8-10-10 12-8-10-10 12-8',
      circlePath(300, 300, 9),
      circlePath(500, 200, 8),
      'M420 478c60 10 120 0 180 30',
      'M540 210l-20 20M556 222l-26 26M572 236l-30 30M588 250l-30 30',
    ],
    notes: [
      { x: 70, y: 250, text: 'counter-balanced arm', arrow: 'M246 256Q280 262 294 282' },
      { x: 620, y: 392, text: 'warm 2700 K', arrow: 'M640 374Q610 340 590 318' },
      { x: 444, y: 540, text: 'felt foot · 180', arrow: 'M440 528Q426 506 418 490' },
    ],
  },
  {
    name: 'Chair',
    rev: 'C',
    guides: ['M60 520H740', 'M260 330L740 180', 'M350 385L740 180', 'M560 350L740 180', 'M478 120V530'],
    lines: [
      'M260 330L470 300L560 350L350 385Z',
      'M260 330v14L350 399L560 364v-14',
      'M276 344L262 520M350 399L344 540',
      'M546 364L560 520M470 312L478 470',
      'M480 304L494 150M552 346L568 192',
      'M488 150Q530 132 570 186L566 214Q530 168 490 176Z',
    ],
    details: [
      'M268 470L346 488L552 470',
      'M504 300L512 174M520 310L530 178M536 322L548 184',
      'M300 340l40-6M330 352l60-9M380 362l60-9',
    ],
    notes: [
      { x: 590, y: 116, text: 'steam-bent ash rail', arrow: 'M600 126Q580 150 568 176' },
      { x: 70, y: 296, text: 'seat height 450', arrow: 'M196 304Q236 316 258 330' },
      { x: 596, y: 484, text: 'splayed legs', arrow: 'M594 470Q574 474 562 494' },
    ],
  },
  {
    name: 'Kettle',
    rev: 'B',
    guides: ['M400 60V520', 'M180 470H620', ellipse(400, 470, 110, 20), ellipse(400, 282, 70, 12), 'M290 515H510M290 507v16M510 507v16'],
    lines: [
      'M290 470Q266 330 332 282L468 282Q534 330 510 470',
      'M290 470Q400 494 510 470',
      'M338 282Q400 250 462 282',
      'M388 262a12 9 0 1 1 24 0',
      'M332 282Q330 186 400 186Q470 186 468 282M350 282Q352 206 400 206Q448 206 450 282',
      'M300 386Q240 366 226 300L244 296Q262 344 304 354',
    ],
    details: ['M224 280q-12-20 0-40q12-20 0-40', 'M246 276q-10-16 0-32q10-16 0-32', 'M480 330q14 50 8 110', 'M296 440Q400 462 504 440'],
    notes: [
      { x: 560, y: 200, text: 'cool-touch handle', arrow: 'M556 208Q510 214 470 232' },
      { x: 70, y: 186, text: 'pours without drips', arrow: 'M190 196Q214 236 226 288' },
      { x: 540, y: 410, text: 'matte enamel · 1.2 L', arrow: 'M536 414Q522 420 512 430' },
    ],
  },
];

const GUIDE_T = 0.22;
const LINE_T = 0.6;
const DETAIL_T = 0.35;
const NOTE_T = 0.45;
const HOLD = 6;
const INK_T = 0.3;

function schedule(concept) {
  const items = [];
  let t = 0;
  const add = (item, dur) => {
    items.push({ ...item, start: t, dur });
    t += dur;
  };
  for (const d of concept.guides) add({ kind: 'guide', d }, GUIDE_T);
  for (const d of concept.lines) add({ kind: 'line', d }, LINE_T);
  for (const d of concept.details) add({ kind: 'detail', d }, DETAIL_T);
  for (const n of concept.notes) add({ kind: 'note', d: n.arrow, note: n }, NOTE_T);
  let lineIndex = 0;
  for (const it of items) if (it.kind === 'line') it.lineIndex = lineIndex++;
  return { items, total: t };
}

function conceptMarkup(concept) {
  const { items } = schedule(concept);
  const path = (it, i, cls) => `<path class="${cls}" data-i="${i}" d="${it.d}" pathLength="1"/>`;
  const guides = items.map((it, i) => (it.kind === 'guide' ? path(it, i, 'w-sk__guide') : '')).join('');
  const lines = items
    .map((it, i) => (it.kind === 'line' || it.kind === 'detail' ? path(it, i, `w-sk__line w-sk__line--${it.kind}`) + `<path class="w-sk__line w-sk__line--ghost" data-i="${i}" d="${it.d}" pathLength="1" transform="translate(1.6 -1.2)"/>` : ''))
    .join('');
  const ink = items.map((it, i) => (it.kind === 'line' ? `<path class="w-sk__ink" data-ink="${i}" d="${it.d}" pathLength="1"/>` : '')).join('');
  const notes = items
    .map((it, i) =>
      it.kind === 'note'
        ? `<g class="w-sk__note" data-note="${i}">${path(it, i, 'w-sk__arrow')}<text x="${it.note.x}" y="${it.note.y}">${esc(it.note.text)}</text></g>`
        : '',
    )
    .join('');
  return `<g class="w-sk__guides">${guides}</g><g class="w-sk__lines">${lines}</g><g class="w-sk__inks">${ink}</g><g class="w-sk__notes">${notes}</g>`;
}

export function render({ world }) {
  return `
  <div class="w-sk__sheet">
    <aside class="w-sk__block">
      <p class="w-sk__sheetno">Concept sheet 17 · <span data-sheet>Lamp — rev. A</span></p>
      <h1 class="w-sk__title">${esc(world.label)}</h1>
      <p class="ww-caption w-sk__caption">${esc(world.description)}</p>
      <div class="w-sk__controls" role="group" aria-label="Sketch controls">
        <button type="button" data-world-action="concept">Next concept → <span data-value>Chair</span></button>
        <button type="button" data-world-action="guides" aria-pressed="true">Guides</button>
        <button type="button" data-world-action="ink" aria-pressed="false">Ink pass</button>
      </div>
      <p class="w-sk__status" data-world-status role="status">Concept 1 of 3: Lamp · guides shown · pencil</p>
    </aside>
    <div class="w-sk__board">
      <svg class="w-sk__drawing" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A design sketch of a lamp drawn live: construction lines, graphite outlines and handwritten notes." data-drawing>
        <g data-concept>${conceptMarkup(CONCEPTS[0])}</g>
        <g class="w-sk__pencil" data-pencil>
          <path d="M0 0l10-4 52-52 8 8-52 52z" class="w-sk__pencil-body"/>
          <path d="M0 0l10-4 -6-6z" class="w-sk__pencil-tip"/>
          <path d="M62-56l8 8 6-6-8-8z" class="w-sk__pencil-end"/>
        </g>
      </svg>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const holder = root.querySelector('[data-concept]');
  const pencil = root.querySelector('[data-pencil]');
  const drawing = root.querySelector('[data-drawing]');
  const state = { concept: 0, guides: true, ink: false };
  let plan = schedule(CONCEPTS[0]);
  let strokes = [];
  let inks = [];
  let T = 0;
  let inkT = 0;

  function collect() {
    strokes = plan.items.map((_, i) => Array.from(holder.querySelectorAll(`[data-i="${i}"]`)));
    inks = plan.items.map((_, i) => holder.querySelector(`[data-ink="${i}"]`));
    plan.items.forEach((it, i) => {
      it.noteEl = it.kind === 'note' ? holder.querySelector(`[data-note="${i}"]`) : null;
      const first = strokes[i][0];
      try {
        it.length = first.getTotalLength();
      } catch {
        it.length = 0;
      }
      it.el = first;
    });
  }

  function sync() {
    const c = CONCEPTS[state.concept];
    root.dataset.guides = String(state.guides);
    root.dataset.ink = String(state.ink);
    root.querySelector('[data-sheet]').textContent = `${c.name} — rev. ${c.rev}`;
    root.querySelector('[data-world-action="concept"] [data-value]').textContent = CONCEPTS[(state.concept + 1) % CONCEPTS.length].name;
    drawing.setAttribute('aria-label', `A design sketch of a ${c.name.toLowerCase()} drawn live: construction lines, graphite outlines and handwritten notes.`);
    ctx.status(`Concept ${state.concept + 1} of ${CONCEPTS.length}: ${c.name} · guides ${state.guides ? 'shown' : 'hidden'} · ${state.ink ? 'inked' : 'pencil'}`);
  }

  function paint(complete) {
    const now = complete ? plan.total + 1 : T;
    let active = null;
    plan.items.forEach((it, i) => {
      const p = clamp((now - it.start) / it.dur, 0, 1);
      const off = (1 - p).toFixed(4);
      for (const el of strokes[i]) el.style.strokeDashoffset = off;
      if (it.noteEl) it.noteEl.style.setProperty('--note', p.toFixed(3));
      if (p > 0 && p < 1 && it.kind !== 'guide') active = { it, p };
      const ink = inks[i];
      if (ink) {
        const ip = complete && state.ink ? 1 : Math.min(p, clamp((inkT - it.lineIndex * INK_T) / INK_T, 0, 1));
        ink.style.strokeDashoffset = (1 - (state.ink ? ip : 0)).toFixed(4);
      }
    });
    if (active && !complete && active.it.length) {
      const pt = active.it.el.getPointAtLength(active.it.length * active.p);
      pencil.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      pencil.style.opacity = '1';
    } else {
      pencil.style.opacity = '0';
    }
  }

  function loadConcept() {
    holder.innerHTML = conceptMarkup(CONCEPTS[state.concept]);
    plan = schedule(CONCEPTS[state.concept]);
    collect();
    T = 0;
    inkT = 0;
  }

  ctx.actions({
    concept() {
      state.concept = (state.concept + 1) % CONCEPTS.length;
      loadConcept();
      sync();
    },
    guides(button) {
      state.guides = !state.guides;
      button.setAttribute('aria-pressed', String(state.guides));
      sync();
    },
    ink(button) {
      state.ink = !state.ink;
      inkT = 0;
      button.setAttribute('aria-pressed', String(state.ink));
      sync();
    },
  });

  collect();

  ctx.loop(({ dt, running }) => {
    if (!running) {
      paint(true);
      return;
    }
    T += dt;
    if (state.ink) inkT += dt;
    if (T > plan.total + HOLD) {
      T = 0;
      inkT = 0;
    }
    paint(false);
  });

  sync();
}
