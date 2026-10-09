import './pixel-art.css';
import { esc } from '../lib/dom.js';

// Logical resolution of the fantasy console. Everything is drawn on integer coordinates
// and the canvas is scaled by a whole number of device pixels, so pixels stay crisp.
const W = 192;
const H = 108;
const GROUND = 86;
const HERO_W = 8;
const HERO_H = 10;
const MAX_COINS = 10;

// 3×5 bitmap font (row-major, 15 bits per glyph).
const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111',
  2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110',
  6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  ' ': '000000000000000', ':': '000010000010000', '-': '000000111000000', '!': '010010010000010',
};

const HERO = {
  walkA: ['..RRRR..', '.RRRRRR.', '..SSSS..', '..SKSK..', '..SSSS..', '.BBBBBB.', 'S.BBBB.S', '..BBBB..', '..L..L..', '.LL..LL.'],
  walkB: ['..RRRR..', '.RRRRRR.', '..SSSS..', '..SKSK..', '..SSSS..', '.BBBBBB.', 'S.BBBB.S', '..BBBB..', '...LL...', '...LL...'],
  jump: ['..RRRR..', '.RRRRRR.', '..SSSS..', '..SKSK..', 'S.SSSS.S', '.BBBBBB.', '..BBBB..', '..BBBB..', '.L....L.', 'LL....LL'],
};
const HERO_COLORS = { R: '#d6303a', S: '#f4c08b', K: '#1b1b2a', B: '#3858d6', L: '#5a3a22' };

const TIMES = [
  {
    id: 'day', name: 'Day',
    sky: ['#3d9df5', '#4fadff', '#66bbff', '#84caff', '#a3d9ff'],
    far: '#86acd8', near: '#4f9a6a', grass: '#4cc35f', grassDark: '#2f8f4e', dirt: '#7a4a2a', dirtDark: '#5e3820',
    sun: '#ffe66b', cloud: '#ffffff', castle: '#a3a8bd', castleDark: '#70748c', window: '#3b3550', hud: '#ffffff', stars: false,
  },
  {
    id: 'dusk', name: 'Dusk',
    sky: ['#2b2a6b', '#5a3a87', '#a8508f', '#ef7a6b', '#ffb36b'],
    far: '#6b4a8a', near: '#3d5560', grass: '#3f9a4f', grassDark: '#2a6a3a', dirt: '#5e3a2a', dirtDark: '#422618',
    sun: '#ff9f43', cloud: '#ffc9b0', castle: '#8b7f9e', castleDark: '#5d5470', window: '#ffd23f', hud: '#fff2d6', stars: false,
  },
  {
    id: 'night', name: 'Night',
    sky: ['#05071a', '#0a1030', '#111a44', '#192556', '#212f68'],
    far: '#28335e', near: '#1c2c3c', grass: '#2b6a40', grassDark: '#1d4a2c', dirt: '#3b2618', dirtDark: '#2a1a10',
    sun: '#f2f2da', cloud: '#34416e', castle: '#4b4f6e', castleDark: '#33364d', window: '#ffd23f', hud: '#dfe6ff', stars: true,
  },
];

export function render({ world }) {
  return `
  <div class="w-px__layout">
    <header class="w-px__head">
      <p class="w-px__kicker">PRESS START · 1 PLAYER</p>
      <h1 class="w-px__title">${esc(world.label)}</h1>
      <p class="ww-caption w-px__caption">${esc(world.description)}</p>
    </header>
    <div class="w-px__console">
      <div class="w-px__bezel">
        <div class="w-px__screen" tabindex="0" data-keys-captured role="application"
          aria-label="Pixel game screen: a small adventurer walks below a hilltop castle collecting coins. When focused, press Space or Up to jump and Left or Right to walk.">
          <canvas class="w-px__canvas" width="${W}" height="${H}" aria-hidden="true"></canvas>
          <p class="w-px__fallback" data-canvas-fallback hidden>Canvas is unavailable, so the pixel island is resting. Imagine a castle, a sunset and a coin just out of reach.</p>
        </div>
        <p class="w-px__brand" aria-hidden="true">WORLDBOY · 8-BIT</p>
      </div>
      <div class="w-px__pad" role="group" aria-label="Console buttons">
        <button type="button" class="w-px__btn w-px__btn--a" data-world-action="jump"><span class="w-px__btn-key" aria-hidden="true">A</span>Jump</button>
        <button type="button" class="w-px__btn w-px__btn--b" data-world-action="coins"><span class="w-px__btn-key" aria-hidden="true">B</span>Bonus coins</button>
        <button type="button" class="w-px__btn w-px__btn--select" data-world-action="time">Time: <span data-value>Day</span></button>
      </div>
      <p class="w-px__status" data-world-status role="status">Time of day: Day · 3 coins on screen</p>
    </div>
  </div>`;
}

function textPx(g, str, x, y, color, shadow) {
  const draw = (ox, oy, fill) => {
    g.fillStyle = fill;
    let cx = x;
    for (const ch of str) {
      const glyph = FONT[ch] ?? FONT[' '];
      for (let i = 0; i < 15; i++) {
        if (glyph[i] === '1') g.fillRect(cx + (i % 3) + ox, y + Math.floor(i / 3) + oy, 1, 1);
      }
      cx += 4;
    }
  };
  if (shadow) draw(1, 1, shadow);
  draw(0, 0, color);
}

function sprite(g, rows, colors, x, y, flip) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const key = row[flip ? row.length - 1 - c : c];
      if (key === '.') continue;
      g.fillStyle = colors[key];
      g.fillRect(x + c, y + r, 1, 1);
    }
  }
}

function disc(g, cx, cy, r) {
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    g.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
}

export function mount(root, ctx) {
  const screen = root.querySelector('.w-px__screen');
  const canvas = root.querySelector('.w-px__canvas');
  let g = null;
  try {
    g = canvas.getContext('2d');
  } catch {
    g = null;
  }
  if (!g) {
    root.querySelector('[data-canvas-fallback]').hidden = false;
    canvas.hidden = true;
  }

  const state = { time: 0, score: 0 };
  const hero = { x: 70, y: GROUND - HERO_H, vy: 0, dir: 1, airborne: false, manual: 0, step: 0 };
  let coins = [];
  let respawns = [];
  let clouds = [
    { x: 20, y: 14, w: 22 },
    { x: 96, y: 24, w: 16 },
    { x: 150, y: 10, w: 26 },
  ];
  let back = null;
  let front = null;

  const rand = (a, b) => a + Math.random() * (b - a);
  const newCoin = () => ({ x: Math.round(rand(16, W - 20)), y: Math.round(rand(GROUND - 30, GROUND - 18)), phase: Math.random() * 4 });
  coins = [newCoin(), newCoin(), newCoin()];

  function buildLayers() {
    if (!g) return;
    const t = TIMES[state.time];
    back = document.createElement('canvas');
    back.width = W;
    back.height = H;
    const b = back.getContext('2d');
    const bandH = 14;
    t.sky.forEach((color, i) => {
      b.fillStyle = color;
      b.fillRect(0, i * bandH, W, i === t.sky.length - 1 ? H : bandH);
    });
    // checkerboard dithering between sky bands
    for (let i = 1; i < t.sky.length; i++) {
      b.fillStyle = t.sky[i - 1];
      const y = i * bandH;
      for (let x = 0; x < W; x += 2) {
        b.fillRect(x, y, 1, 1);
        b.fillRect(x + 1, y + 2, 1, 1);
      }
    }
    if (t.stars) {
      b.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) b.fillRect((i * 53) % W, (i * 29) % 56, 1, 1);
    }
    b.fillStyle = t.sun;
    disc(b, 156, 20, 8);
    if (t.id === 'night') {
      b.fillStyle = t.sky[1];
      disc(b, 160, 17, 7);
    }

    front = document.createElement('canvas');
    front.width = W;
    front.height = H;
    const f = front.getContext('2d');
    // castle hill
    f.fillStyle = t.grassDark;
    for (let x = 0; x < 64; x++) {
      const top = Math.round(66 - Math.sin((x / 64) * Math.PI) * 8);
      f.fillRect(x, top, 1, GROUND - top);
    }
    // castle
    f.fillStyle = t.castle;
    f.fillRect(18, 42, 28, 20);
    f.fillRect(14, 34, 8, 28);
    f.fillRect(42, 34, 8, 28);
    for (let x = 14; x < 50; x += 4) f.fillRect(x, x < 22 || x >= 42 ? 30 : 38, 2, 4);
    f.fillStyle = t.castleDark;
    f.fillRect(14, 58, 36, 4);
    f.fillRect(29, 50, 6, 12);
    f.fillStyle = t.window;
    f.fillRect(17, 40, 2, 3);
    f.fillRect(45, 40, 2, 3);
    f.fillRect(25, 46, 2, 3);
    f.fillRect(37, 46, 2, 3);
    f.fillStyle = '#d6303a';
    f.fillRect(17, 24, 1, 6);
    f.fillRect(18, 24, 4, 2);
    // ground
    f.fillStyle = t.dirt;
    f.fillRect(0, GROUND, W, H - GROUND);
    f.fillStyle = t.dirtDark;
    for (let y = GROUND + 5; y < H; y += 5) {
      for (let x = (y / 5) % 2 ? 0 : 6; x < W; x += 12) f.fillRect(x, y, 5, 1);
    }
    f.fillStyle = t.grass;
    f.fillRect(0, GROUND, W, 3);
    f.fillStyle = t.grassDark;
    for (let x = 0; x < W; x += 3) f.fillRect(x, GROUND + 3, 1, 1);
  }

  function fit() {
    const rect = screen.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.max(1, Math.floor(Math.min((rect.width * dpr) / W, (rect.height * dpr) / H)));
    canvas.style.width = `${(W * scale) / dpr}px`;
    canvas.style.height = `${(H * scale) / dpr}px`;
  }

  function jump() {
    if (hero.airborne) return;
    hero.vy = -122;
    hero.airborne = true;
  }

  function sync() {
    const t = TIMES[state.time];
    root.dataset.time = t.id;
    root.querySelector('[data-world-action="time"] [data-value]').textContent = t.name;
    ctx.status(`Time of day: ${t.name} · ${coins.length} coin${coins.length === 1 ? '' : 's'} on screen`);
  }

  ctx.actions({
    jump() {
      if (ctx.running) jump();
      else {
        // Stationary alternative: show the jump pose at its peak.
        hero.y = GROUND - HERO_H - 22;
        hero.vy = 0;
        hero.airborne = true;
      }
      sync();
    },
    coins() {
      for (let i = 0; i < 3 && coins.length < MAX_COINS; i++) coins.push(newCoin());
      sync();
    },
    time() {
      state.time = (state.time + 1) % TIMES.length;
      buildLayers();
      sync();
    },
  });

  ctx.on(screen, 'keydown', (event) => {
    if (event.key === ' ' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (ctx.running) jump();
      ctx.redraw();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      hero.dir = event.key === 'ArrowLeft' ? -1 : 1;
      hero.manual = 2.5;
      ctx.redraw();
    }
  });

  if (g) {
    ctx.onResize(screen, () => {
      fit();
      ctx.redraw();
    });
    fit();
    buildLayers();
  }

  function update(dt) {
    hero.manual = Math.max(0, hero.manual - dt);
    hero.x += hero.dir * 24 * dt;
    if (hero.x < 4) {
      hero.x = 4;
      hero.dir = 1;
    } else if (hero.x > W - HERO_W - 4) {
      hero.x = W - HERO_W - 4;
      hero.dir = -1;
    }
    if (!hero.airborne && hero.manual === 0) {
      const ahead = coins.find((c) => {
        const dx = (c.x - hero.x) * hero.dir;
        return dx > 2 && dx < 16;
      });
      if (ahead) jump();
    }
    if (hero.airborne) {
      hero.vy += 330 * dt;
      hero.y += hero.vy * dt;
      if (hero.y >= GROUND - HERO_H) {
        hero.y = GROUND - HERO_H;
        hero.vy = 0;
        hero.airborne = false;
      }
    }
    hero.step += dt * 8;

    const hx = Math.round(hero.x);
    const hy = Math.round(hero.y);
    coins = coins.filter((c) => {
      const hit = hx < c.x + 5 && hx + HERO_W > c.x && hy < c.y + 5 && hy + HERO_H > c.y;
      if (hit) {
        state.score += 10;
        respawns.push(2.5);
      }
      return !hit;
    });
    respawns = respawns.map((r) => r - dt).filter((r) => {
      if (r <= 0) {
        if (coins.length < MAX_COINS) coins.push(newCoin());
        return false;
      }
      return true;
    });
    for (const c of clouds) {
      c.x -= 4 * dt;
      if (c.x < -c.w - 4) c.x = W + 4;
    }
  }

  function draw(time) {
    const t = TIMES[state.time];
    g.imageSmoothingEnabled = false;
    g.drawImage(back, 0, 0);
    const cam = Math.floor(time * 6);
    g.fillStyle = t.far;
    for (let x = 0; x < W; x++) {
      const wx = x + Math.floor(cam * 0.25);
      const top = Math.round(54 + Math.sin(wx * 0.05) * 7 + Math.sin(wx * 0.13 + 1) * 4);
      g.fillRect(x, top, 1, GROUND - top);
    }
    g.fillStyle = t.cloud;
    for (const c of clouds) {
      const x = Math.round(c.x);
      g.fillRect(x + 3, c.y, c.w - 6, 2);
      g.fillRect(x, c.y + 2, c.w, 3);
      g.fillRect(x + 5, c.y - 2, Math.round(c.w / 3), 2);
    }
    g.fillStyle = t.near;
    for (let x = 0; x < W; x++) {
      const wx = x + Math.floor(cam * 0.6);
      const top = Math.round(70 + Math.sin(wx * 0.08) * 4 + Math.sin(wx * 0.21) * 2);
      g.fillRect(x, top, 1, GROUND - top);
    }
    g.drawImage(front, 0, 0);

    for (const c of coins) {
      const frame = Math.floor(time * 8 + c.phase) % 4;
      const w = [5, 3, 1, 3][frame];
      const bob = Math.round(Math.sin(time * 3 + c.phase));
      g.fillStyle = '#ffd23f';
      g.fillRect(c.x + Math.floor((5 - w) / 2), c.y + bob, w, 5);
      g.fillStyle = '#b8860b';
      if (w > 1) g.fillRect(c.x + Math.floor((5 - w) / 2) + w - 1, c.y + bob + 1, 1, 3);
    }

    const frames = hero.airborne ? HERO.jump : Math.floor(hero.step) % 2 ? HERO.walkA : HERO.walkB;
    sprite(g, frames, HERO_COLORS, Math.round(hero.x), Math.round(hero.y), hero.dir < 0);

    textPx(g, `SCORE ${String(state.score).padStart(5, '0')}`, 3, 3, t.hud, '#000000');
    const label = t.name.toUpperCase();
    textPx(g, label, W - 3 - label.length * 4, 3, t.hud, '#000000');
  }

  ctx.loop(({ dt, time }) => {
    if (!g) return;
    if (dt > 0) update(dt);
    draw(time);
  });

  sync();
}
