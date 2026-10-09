import './retro-vhs.css';
import { esc } from '../lib/dom.js';
import { approach, clamp, TAU } from '../lib/math.js';

const BW = 320;
const BH = 240;
const DECKS = [
  { id: 'play', osd: 'PLAY ▶', name: 'Play', speed: 1 },
  { id: 'ff', osd: 'FF ▶▶', name: 'Fast-forward', speed: 4 },
  { id: 'rew', osd: 'REW ◀◀', name: 'Rewind', speed: -3 },
];
const CHANNELS = [
  { no: '03', name: 'Beach at dusk' },
  { no: '04', name: 'Night drive' },
  { no: '05', name: 'Birthday party' },
];
const TRACKING = [
  { name: 'soft wobble', amount: 0.45 },
  { name: 'wobbly', amount: 1 },
  { name: 'clean', amount: 0.08 },
];

function beach(g, t) {
  const sky = g.createLinearGradient(0, 0, 0, 150);
  sky.addColorStop(0, '#2b2a6b');
  sky.addColorStop(0.55, '#c8507a');
  sky.addColorStop(1, '#ffb36b');
  g.fillStyle = sky;
  g.fillRect(0, 0, BW, 150);
  g.fillStyle = '#ffd98a';
  g.beginPath();
  g.arc(210, 130 + Math.sin(t * 0.05) * 6, 30, 0, TAU);
  g.fill();
  g.fillStyle = '#2a3f7a';
  g.fillRect(0, 148, BW, 92);
  g.strokeStyle = 'rgba(255,214,150,0.7)';
  g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    const y = 152 + i * 6 + i * i * 0.2;
    const off = Math.sin(t * 1.4 + i) * 10;
    g.beginPath();
    g.moveTo(180 + off - i * 4, y);
    g.lineTo(240 + off + i * 4, y);
    g.stroke();
  }
  g.fillStyle = '#e8c48a';
  g.beginPath();
  g.moveTo(0, 240);
  g.lineTo(0, 205);
  g.quadraticCurveTo(140, 190, 320, 230);
  g.lineTo(320, 240);
  g.fill();
  const palm = (x, h, lean, phase) => {
    const sway = Math.sin(t * 0.9 + phase) * 5;
    g.strokeStyle = '#1a1020';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x, 225);
    g.quadraticCurveTo(x + lean * 0.5, 225 - h * 0.5, x + lean + sway, 225 - h);
    g.stroke();
    g.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI + Math.PI + Math.sin(t + k) * 0.08;
      g.beginPath();
      g.moveTo(x + lean + sway, 225 - h);
      g.quadraticCurveTo(x + lean + sway + Math.cos(a) * 24, 225 - h + Math.sin(a) * 18 - 8, x + lean + sway + Math.cos(a) * 40, 225 - h + Math.sin(a) * 10 + 14);
      g.stroke();
    }
  };
  palm(50, 120, 24, 0);
  palm(86, 90, -10, 1.3);
  g.strokeStyle = '#1a1020';
  g.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const x = ((t * 14 + i * 60) % 380) - 30;
    const y = 50 + i * 14 + Math.sin(t + i) * 4;
    g.beginPath();
    g.moveTo(x - 6, y - 3);
    g.lineTo(x, y);
    g.lineTo(x + 6, y - 3);
    g.stroke();
  }
}

function drive(g, t) {
  const sky = g.createLinearGradient(0, 0, 0, 120);
  sky.addColorStop(0, '#05060f');
  sky.addColorStop(1, '#2a2050');
  g.fillStyle = sky;
  g.fillRect(0, 0, BW, 120);
  g.fillStyle = '#ffb35a';
  for (let i = 0; i < 26; i++) g.fillRect((i * 37) % BW, 104 + ((i * 13) % 12), 2, 2);
  g.fillStyle = '#121218';
  g.beginPath();
  g.moveTo(0, 240);
  g.lineTo(150, 118);
  g.lineTo(170, 118);
  g.lineTo(320, 240);
  g.fill();
  g.fillStyle = '#0b0b10';
  g.fillRect(0, 118, 150, 122);
  g.fillRect(170, 118, 150, 122);
  g.fillStyle = '#f2e6b8';
  for (let k = 0; k < 8; k++) {
    const z = ((k + ((t * 1.6) % 1)) / 8) ** 2;
    const y = 120 + z * 120;
    const w = 1 + z * 8;
    g.fillRect(160 - w / 2, y, w, 2 + z * 12);
  }
  for (let k = 0; k < 4; k++) {
    const z = ((k + ((t * 0.8) % 1)) / 4) ** 2;
    for (const side of [-1, 1]) {
      const x = 160 + side * (12 + z * 220);
      const top = 118 - z * 120;
      g.strokeStyle = '#3a3a48';
      g.lineWidth = 1 + z * 3;
      g.beginPath();
      g.moveTo(x, 118 + z * 120);
      g.lineTo(x, top);
      g.stroke();
      const glow = g.createRadialGradient(x, top, 0, x, top, 6 + z * 30);
      glow.addColorStop(0, 'rgba(255,214,140,0.9)');
      glow.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = glow;
      g.fillRect(x - 40, top - 40, 80, 80);
    }
  }
  g.fillStyle = '#07070a';
  g.fillRect(0, 200, BW, 40);
  g.fillStyle = '#3cff9e';
  g.fillRect(140, 214, 40, 6);
  g.fillStyle = '#ff6b4a';
  g.beginPath();
  g.arc(100, 222, 10, Math.PI, 0);
  g.fill();
}

function party(g, t) {
  g.fillStyle = '#f2c6a0';
  g.fillRect(0, 0, BW, BH);
  g.fillStyle = '#e8b48a';
  for (let x = 0; x < BW; x += 24) g.fillRect(x, 0, 12, 170);
  g.fillStyle = '#7a4a32';
  g.fillRect(0, 170, BW, 70);
  g.fillStyle = '#f6efe6';
  g.fillRect(110, 140, 100, 34);
  g.fillStyle = '#ff8fb0';
  g.fillRect(110, 150, 100, 8);
  for (let i = 0; i < 5; i++) {
    const x = 122 + i * 19;
    g.fillStyle = '#9fd8ff';
    g.fillRect(x, 124, 4, 16);
    const sway = Math.sin(t * 4 + i * 1.7) * 1.2;
    g.fillStyle = '#ffd36b';
    g.beginPath();
    g.ellipse(x + 2 + sway, 119, 3, 5, 0, 0, TAU);
    g.fill();
  }
  const colors = ['#ff5f7a', '#5fb8ff', '#ffd23f', '#7dff9b'];
  for (let i = 0; i < 4; i++) {
    const x = 40 + i * 78 + Math.sin(t * 0.7 + i) * 6;
    const y = 70 - ((t * 6 + i * 20) % 30) + Math.sin(t + i) * 3;
    g.strokeStyle = '#5a3a2a';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y + 22);
    g.quadraticCurveTo(x + 6, y + 50, x - 2, y + 90);
    g.stroke();
    g.fillStyle = colors[i];
    g.beginPath();
    g.ellipse(x, y, 15, 20, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.beginPath();
    g.ellipse(x - 5, y - 7, 3, 6, -0.4, 0, TAU);
    g.fill();
  }
}

const SCENES = [beach, drive, party];

export function render({ world }) {
  return `
  <div class="w-vhs__layout">
    <div class="w-vhs__tv">
      <div class="w-vhs__screen">
        <canvas class="w-vhs__canvas" aria-hidden="true"></canvas>
        <div class="w-vhs__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — the tape is paused on a blue screen.</p></div>
        <div class="w-vhs__scan" aria-hidden="true"></div>
        <div class="w-vhs__osd" aria-hidden="true">
          <span class="w-vhs__osd-mode" data-osd-mode>PLAY ▶</span>
          <span class="w-vhs__osd-sp">SP</span>
          <span class="w-vhs__osd-ch" data-osd-ch>CH 03</span>
          <span class="w-vhs__osd-tc" data-osd-tc>0:00:00:00</span>
        </div>
      </div>
      <div class="w-vhs__knobs" aria-hidden="true"><span></span><span></span><i></i><i></i><i></i></div>
    </div>
    <section class="w-vhs__panel">
      <p class="w-vhs__label">T-120 · home recording · “summer, mostly”</p>
      <h1 class="w-vhs__title">${esc(world.label)}</h1>
      <p class="ww-caption w-vhs__caption">${esc(world.description)}</p>
      <div class="w-vhs__controls" role="group" aria-label="Deck controls">
        <button type="button" data-world-action="deck">Deck: <span data-value>Play</span></button>
        <button type="button" data-world-action="tracking">Tracking: <span data-tracking>soft wobble</span></button>
        <button type="button" data-world-action="channel">Channel: <span data-channel>03</span></button>
      </div>
      <p class="w-vhs__status" data-world-status role="status">PLAY · CH 03 Beach at dusk · tracking soft wobble</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const canvas = root.querySelector('.w-vhs__canvas');
  const osdMode = root.querySelector('[data-osd-mode]');
  const osdCh = root.querySelector('[data-osd-ch]');
  const osdTc = root.querySelector('[data-osd-tc]');
  const state = { deck: 0, tracking: 0, channel: 0 };
  let tape = 754.3;
  let roll = 0;
  let speed = 1;
  const buffer = document.createElement('canvas');
  buffer.width = BW;
  buffer.height = BH;
  const b = buffer.getContext('2d');

  const view = ctx.canvas(canvas, { maxDpr: 1, alpha: false });

  function sync() {
    const deck = DECKS[state.deck];
    const ch = CHANNELS[state.channel];
    osdMode.textContent = deck.osd;
    osdCh.textContent = `CH ${ch.no}`;
    root.querySelector('[data-world-action="deck"] [data-value]').textContent = deck.name;
    root.querySelector('[data-tracking]').textContent = TRACKING[state.tracking].name;
    root.querySelector('[data-channel]').textContent = ch.no;
    ctx.status(`${deck.osd.split(' ')[0]} · CH ${ch.no} ${ch.name} · tracking ${TRACKING[state.tracking].name}`);
  }

  ctx.actions({
    deck() {
      state.deck = (state.deck + 1) % DECKS.length;
      sync();
    },
    tracking() {
      state.tracking = (state.tracking + 1) % TRACKING.length;
      sync();
    },
    channel() {
      state.channel = (state.channel + 1) % CHANNELS.length;
      roll = ctx.running ? 1 : 0;
      sync();
    },
  });

  ctx.loop(({ dt, time }) => {
    if (!view || !b) return;
    const { g, w, h } = view;
    speed = dt ? approach(speed, DECKS[state.deck].speed, 3, dt) : DECKS[state.deck].speed;
    tape = Math.max(0, tape + dt * speed);
    roll = Math.max(0, roll - dt * 1.6);

    SCENES[state.channel](b, tape);

    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    g.imageSmoothingEnabled = true;
    const rollY = roll > 0 ? Math.round((1 - roll) * h) % h : 0;
    g.globalAlpha = 1;
    g.drawImage(buffer, 0, 0, BW, BH, 0, rollY, w, h);
    if (rollY) g.drawImage(buffer, 0, 0, BW, BH, 0, rollY - h, w, h);
    // soft chroma ghost
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = 0.22;
    g.drawImage(buffer, 0, 0, BW, BH, 3, rollY, w, h);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;

    // tracking band: slices shifted sideways, low contrast
    const amt = TRACKING[state.tracking].amount * (Math.abs(speed) > 1.5 ? 1.6 : 1);
    const bandH = h * 0.09;
    const bandY = (((time * 0.16) % 1.3) - 0.15) * h;
    const slices = 10;
    for (let i = 0; i < slices; i++) {
      const y = bandY + (i / slices) * bandH;
      const shift = Math.sin(time * 9 + i * 1.7) * 9 * amt;
      const sy = clamp((y / h) * BH, 0, BH - 1);
      g.drawImage(buffer, 0, sy, BW, (bandH / slices / h) * BH, shift, y, w, bandH / slices);
    }
    g.fillStyle = `rgba(255,255,255,${(0.05 * amt).toFixed(3)})`;
    g.fillRect(0, bandY + bandH * 0.4, w, bandH * 0.2);

    // head-switching noise along the bottom edge
    const hs = h * 0.035;
    for (let i = 0; i < 4; i++) {
      const y = h - hs + (i / 4) * hs;
      const shift = 6 + Math.sin(time * 13 + i) * 6;
      g.drawImage(buffer, 0, BH - 6 + i, BW, 1.5, shift, y, w, hs / 4);
    }

    // sparse tape grain
    g.fillStyle = 'rgba(255,255,255,0.18)';
    const grains = 40 + Math.round(amt * 60) + (Math.abs(speed) > 1.5 ? 60 : 0);
    for (let i = 0; i < grains; i++) g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1);
    if (Math.abs(speed) > 1.5) {
      g.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 3; i++) g.fillRect(0, ((time * 0.7 + i / 3) % 1) * h, w, 2);
    }

    const secs = Math.floor(tape);
    const frames = Math.floor((tape % 1) * 30);
    osdTc.textContent = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  });

  sync();
}
