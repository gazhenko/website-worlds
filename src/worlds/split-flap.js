import './split-flap.css';
import { esc } from '../lib/dom.js';

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-.'*";
const DESTS = ['LUMEN BAY', 'PORT QUIET', 'NINEFOLD', 'ASHGROVE', 'SALT MERIDIAN', 'OXBOW CROSS', 'HALCYON', 'NORTH ARCHIVE', 'VELLUM', 'CINDER QUAY', 'BRIGHTWATER', 'MOSS END'];
const DEP_STATUS = ['ON TIME', 'BOARDING', 'DELAYED', 'GATE OPEN', 'DEPARTED', 'FINAL CALL'];
const ARR_STATUS = ['LANDED', 'EXPECTED', 'ON TIME', 'DELAYED', 'BAGGAGE'];
const MESSAGE = ['WELCOME TO', 'WEBSITE WORLDS', 'MIND THE GAP', 'BETWEEN THE', 'FLAPS', '* 39 STOPS *'];
const MODES = [
  { id: 'departures', name: 'Departures' },
  { id: 'arrivals', name: 'Arrivals' },
  { id: 'message', name: 'Message' },
];
const SPEEDS = [
  { id: 'brisk', name: 'Brisk', step: 0.045 },
  { id: 'leisurely', name: 'Leisurely', step: 0.11 },
];
const ROWS = 6;
const LAYOUTS = {
  wide: [
    { key: 'time', label: 'TIME', width: 5 },
    { key: 'place', label: 'DESTINATION', width: 13 },
    { key: 'plat', label: 'PL', width: 2 },
    { key: 'status', label: 'STATUS', width: 10 },
  ],
  narrow: [
    { key: 'time', label: 'TIME', width: 5 },
    { key: 'place', label: 'TO', width: 9 },
    { key: 'status', label: 'STATUS', width: 7 },
  ],
};

const fit = (text, width) => text.toUpperCase().slice(0, width).padEnd(width, ' ');
const sanitize = (text) =>
  Array.from(text.toUpperCase())
    .map((ch) => (CHARSET.includes(ch) ? ch : ' '))
    .join('');

function cellMarkup() {
  return `<span class="w-flap__cell"><span class="w-flap__half w-flap__top"><span> </span></span><span class="w-flap__half w-flap__bottom"><span> </span></span><span class="w-flap__flap w-flap__flap--top"><span> </span></span><span class="w-flap__flap w-flap__flap--bottom"><span> </span></span></span>`;
}

export function render({ world }) {
  return `
  <div class="w-flap__wrap">
    <header class="w-flap__head">
      <div>
        <p class="w-flap__kicker">Central Concourse · Board 35</p>
        <h1 class="w-flap__title">${esc(world.label)}</h1>
      </div>
      <div class="w-flap__clock" data-clock aria-hidden="true"></div>
    </header>
    <section class="w-flap__board" aria-labelledby="w-flap-board-title">
      <div class="w-flap__board-top">
        <h2 id="w-flap-board-title" class="w-flap__board-title" data-board-title>Departures</h2>
        <span class="w-flap__lamp" aria-hidden="true"></span>
      </div>
      <div class="w-flap__cols" data-cols aria-hidden="true"></div>
      <div class="w-flap__rows" data-rows aria-hidden="true"></div>
      <ul class="ww-vh" data-transcript></ul>
    </section>
    <div class="w-flap__panel">
      <p class="ww-caption w-flap__caption">${esc(world.description)}</p>
      <div class="w-flap__controls" role="group" aria-label="Board controls">
        <button type="button" data-world-action="refresh">Refresh board</button>
        <button type="button" data-world-action="mode">Mode: <span data-value>Departures</span></button>
        <button type="button" data-world-action="speed">Flaps: <span data-speed>Brisk</span></button>
      </div>
      <p class="w-flap__status" data-world-status role="status">Departures board · brisk flaps</p>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const rowsEl = root.querySelector('[data-rows]');
  const colsEl = root.querySelector('[data-cols]');
  const clockEl = root.querySelector('[data-clock]');
  const transcript = root.querySelector('[data-transcript]');
  const board = root.querySelector('.w-flap__board');
  const state = { mode: 0, speed: 0, refreshes: 0, seed: 1 };
  let layoutName = '';
  let cells = [];
  let clockCells = [];
  let rowsData = [];

  function makeCell(el) {
    return {
      el,
      top: el.querySelector('.w-flap__top span'),
      bottom: el.querySelector('.w-flap__bottom span'),
      flapTop: el.querySelector('.w-flap__flap--top'),
      flapBottom: el.querySelector('.w-flap__flap--bottom'),
      flapTopText: el.querySelector('.w-flap__flap--top span'),
      flapBottomText: el.querySelector('.w-flap__flap--bottom span'),
      cur: ' ',
      next: ' ',
      target: ' ',
      p: 0,
      delay: 0,
      active: false,
    };
  }

  function paintStatic(c) {
    c.top.textContent = c.cur;
    c.bottom.textContent = c.cur;
    c.flapTop.style.visibility = 'hidden';
    c.flapBottom.style.visibility = 'hidden';
  }

  function setTarget(c, ch, delay) {
    const target = CHARSET.includes(ch) ? ch : ' ';
    c.target = target;
    if (!ctx.running) {
      c.cur = target;
      c.active = false;
      paintStatic(c);
      return;
    }
    if (c.cur === target) return;
    c.delay = delay;
    if (!c.active) {
      c.active = true;
      c.p = 0;
      c.next = CHARSET[(CHARSET.indexOf(c.cur) + 1) % CHARSET.length];
      c.top.textContent = c.next;
      c.flapTopText.textContent = c.cur;
      c.flapBottomText.textContent = c.next;
    }
  }

  function stepCell(c, dt, stepDur) {
    if (!c.active) return;
    if (c.delay > 0) {
      c.delay -= dt;
      return;
    }
    c.p += dt / stepDur;
    while (c.p >= 1) {
      c.p -= 1;
      c.cur = c.next;
      if (c.cur === c.target) {
        c.active = false;
        c.p = 0;
        paintStatic(c);
        return;
      }
      c.next = CHARSET[(CHARSET.indexOf(c.cur) + 1) % CHARSET.length];
      c.top.textContent = c.next;
      c.bottom.textContent = c.cur;
      c.flapTopText.textContent = c.cur;
      c.flapBottomText.textContent = c.next;
    }
    c.bottom.textContent = c.cur;
    if (c.p < 0.5) {
      c.flapTop.style.visibility = 'visible';
      c.flapBottom.style.visibility = 'hidden';
      c.flapTop.style.transform = `rotateX(${(-c.p * 180).toFixed(1)}deg)`;
      c.flapTop.style.filter = `brightness(${(1 - c.p * 0.6).toFixed(2)})`;
    } else {
      c.flapTop.style.visibility = 'hidden';
      c.flapBottom.style.visibility = 'visible';
      c.flapBottom.style.transform = `rotateX(${(90 - (c.p - 0.5) * 180).toFixed(1)}deg)`;
      c.flapBottom.style.filter = `brightness(${(0.7 + (c.p - 0.5) * 0.6).toFixed(2)})`;
    }
  }

  function rand(n) {
    state.seed = (state.seed * 16807) % 2147483647;
    return state.seed % n;
  }

  function generate() {
    const mode = MODES[state.mode].id;
    const now = new Date();
    let minutes = now.getHours() * 60 + now.getMinutes();
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      if (mode === 'message') {
        rows.push({ message: MESSAGE[r] ?? '' });
        continue;
      }
      minutes += 4 + rand(14);
      const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
      const mm = String(minutes % 60).padStart(2, '0');
      rows.push({
        time: `${hh}:${mm}`,
        place: DESTS[rand(DESTS.length)],
        plat: String(1 + rand(12)),
        status: (mode === 'arrivals' ? ARR_STATUS : DEP_STATUS)[rand(mode === 'arrivals' ? ARR_STATUS.length : DEP_STATUS.length)],
      });
    }
    return rows;
  }

  function rowText(row, layout) {
    if (row.message !== undefined) {
      const total = layout.reduce((s, col) => s + col.width, 0) + layout.length - 1;
      const msg = row.message.slice(0, total);
      const left = Math.floor((total - msg.length) / 2);
      return sanitize(' '.repeat(left) + msg).padEnd(total, ' ');
    }
    return layout.map((col) => sanitize(fit(row[col.key] ?? '', col.width))).join(' ');
  }

  function applyRows(stagger = true) {
    const layout = LAYOUTS[layoutName];
    rowsData.forEach((row, r) => {
      const text = rowText(row, layout);
      const rowCells = cells[r];
      for (let i = 0; i < rowCells.length; i++) setTarget(rowCells[i], text[i] ?? ' ', stagger ? r * 0.09 + i * 0.025 : 0);
    });
    const mode = MODES[state.mode];
    transcript.innerHTML = rowsData
      .map((row) => `<li>${esc(row.message !== undefined ? row.message : `${row.time}, ${row.place}, platform ${row.plat}, ${row.status}`)}</li>`)
      .join('');
    root.querySelector('[data-board-title]').textContent = mode.name;
  }

  function build() {
    const style = getComputedStyle(board);
    const width = board.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const next = width / 34 >= 17 ? 'wide' : 'narrow';
    const nextLayout = LAYOUTS[next];
    const nextTotal = nextLayout.reduce((s, col) => s + col.width, 0) + nextLayout.length - 1;
    const cell = Math.max(9, Math.min(40, Math.floor((width - (nextTotal - 1) * 3) / nextTotal)));
    root.style.setProperty('--cell', `${cell}px`);
    if (next === layoutName && cells.length) return;
    layoutName = next;
    const layout = nextLayout;
    const total = nextTotal;
    root.style.setProperty('--cells', String(total));
    colsEl.innerHTML = layout.map((col) => `<span style="--w:${col.width}">${col.label}</span>`).join('');
    rowsEl.innerHTML = Array.from({ length: ROWS }, () => `<div class="w-flap__row">${Array.from({ length: total }, cellMarkup).join('')}</div>`).join('');
    cells = Array.from(rowsEl.querySelectorAll('.w-flap__row')).map((row) => Array.from(row.querySelectorAll('.w-flap__cell')).map(makeCell));
    cells.flat().forEach(paintStatic);
    applyRows(false);
  }

  function updateClock() {
    const now = new Date();
    const text = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    clockCells.forEach((c, i) => setTarget(c, text[i], i * 0.05));
  }

  function sync() {
    root.querySelector('[data-world-action="mode"] [data-value]').textContent = MODES[state.mode].name;
    root.querySelector('[data-speed]').textContent = SPEEDS[state.speed].name;
    const refreshed = state.refreshes ? ` · refreshed ${state.refreshes} time${state.refreshes === 1 ? '' : 's'}` : '';
    ctx.status(`${MODES[state.mode].name} board · ${SPEEDS[state.speed].name.toLowerCase()} flaps${refreshed}`);
  }

  ctx.actions({
    refresh() {
      state.refreshes += 1;
      rowsData = generate();
      applyRows();
      sync();
    },
    mode() {
      state.mode = (state.mode + 1) % MODES.length;
      rowsData = generate();
      applyRows();
      sync();
    },
    speed() {
      state.speed = (state.speed + 1) % SPEEDS.length;
      sync();
    },
  });

  clockEl.innerHTML = Array.from({ length: 5 }, cellMarkup).join('');
  clockCells = Array.from(clockEl.querySelectorAll('.w-flap__cell')).map(makeCell);
  clockCells.forEach(paintStatic);

  state.seed = (Date.now() % 100000) + 7;
  rowsData = generate();
  build();
  // Start the first reveal from blanks so the board visibly clatters to life.
  cells.flat().forEach((c) => {
    c.cur = ' ';
    paintStatic(c);
  });
  applyRows();
  updateClock();

  ctx.onResize(board, () => {
    build();
  });

  ctx.every(10000, updateClock, { whilePaused: true });
  ctx.every(9000, () => {
    if (MODES[state.mode].id === 'message') return;
    const r = rand(ROWS);
    const list = MODES[state.mode].id === 'arrivals' ? ARR_STATUS : DEP_STATUS;
    rowsData[r] = { ...rowsData[r], status: list[rand(list.length)] };
    applyRows(false);
  });

  ctx.onMotion(
    (motion) => {
      if (!motion.running) {
        for (const c of cells.flat().concat(clockCells)) {
          c.cur = c.target;
          c.active = false;
          paintStatic(c);
        }
      }
    },
    { immediate: false },
  );

  ctx.loop(({ dt }) => {
    if (!dt) return;
    const stepDur = SPEEDS[state.speed].step;
    for (const row of cells) for (const c of row) stepCell(c, dt, stepDur);
    for (const c of clockCells) stepCell(c, dt, stepDur);
  });

  sync();
}
