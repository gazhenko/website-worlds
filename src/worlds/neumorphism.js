import './neumorphism.css';
import { esc } from '../lib/dom.js';
import { approach } from '../lib/math.js';

const MIN = 16;
const MAX = 28;

function ticks() {
  let d = '';
  for (let i = 0; i <= 24; i++) {
    const a = ((-135 + (i / 24) * 270) * Math.PI) / 180;
    const r1 = i % 4 === 0 ? 86 : 89;
    d += `M${(100 + Math.sin(a) * r1).toFixed(1)} ${(100 - Math.cos(a) * r1).toFixed(1)}L${(100 + Math.sin(a) * 95).toFixed(1)} ${(100 - Math.cos(a) * 95).toFixed(1)}`;
  }
  return d;
}

export function render({ world }) {
  return `
  <div class="w-neu__layout">
    <header class="w-neu__head">
      <p class="w-neu__kicker">Calm room · climate console</p>
      <h1 class="w-neu__title">${esc(world.label)}</h1>
      <p class="ww-caption w-neu__caption">${esc(world.description)}</p>
    </header>
    <section class="w-neu__console w-neu__raised" aria-label="Climate console">
      <span class="w-neu__lamp" aria-hidden="true"></span>
      <div class="w-neu__dial-wrap">
        <svg class="w-neu__ticks" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><path d="${ticks()}"/></svg>
        <button type="button" class="w-neu__dial w-neu__raised" data-world-action="press" aria-pressed="false">
          <span class="ww-vh">Press the dial in. Current setting: </span>
          <span class="w-neu__face w-neu__inset">
            <span class="w-neu__marker" data-marker aria-hidden="true"><span></span></span>
            <span class="w-neu__temp"><span data-temp>21.5</span><small>°C</small></span>
            <span class="w-neu__mode" data-mode>Holding</span>
          </span>
        </button>
      </div>
      <div class="w-neu__keys" role="group" aria-label="Temperature">
        <button type="button" class="w-neu__key w-neu__raised" data-world-action="cooler"><span aria-hidden="true">−</span> Cooler</button>
        <button type="button" class="w-neu__key w-neu__raised" data-world-action="warmer"><span aria-hidden="true">+</span> Warmer</button>
      </div>
      <div class="w-neu__meter w-neu__inset" aria-hidden="true"><span class="w-neu__meter-fill w-neu__raised" data-meter></span></div>
      <div class="w-neu__switches" role="group" aria-label="Surface settings">
        <button type="button" class="w-neu__switch" data-world-action="light" aria-pressed="true">
          <span class="w-neu__track w-neu__inset" aria-hidden="true"><span class="w-neu__knob w-neu__raised"></span></span>Orbiting light
        </button>
        <button type="button" class="w-neu__switch" data-world-action="theme" aria-pressed="false">
          <span class="w-neu__track w-neu__inset" aria-hidden="true"><span class="w-neu__knob w-neu__raised"></span></span>Night surface
        </button>
      </div>
      <p class="w-neu__status w-neu__inset" data-world-status role="status">21.5 °C · holding · dial raised · light orbiting · day surface</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const tempEl = root.querySelector('[data-temp]');
  const modeEl = root.querySelector('[data-mode]');
  const marker = root.querySelector('[data-marker]');
  const meter = root.querySelector('[data-meter]');
  const state = { temp: 21.5, pressed: false, orbit: true, night: false };
  let angle = Math.PI / 4;
  let shown = state.temp;

  const mode = () => (state.temp > 22.5 ? 'Heating' : state.temp < 20.5 ? 'Cooling' : 'Holding');

  function sync() {
    root.dataset.surface = state.night ? 'night' : 'day';
    root.dataset.pressed = String(state.pressed);
    tempEl.textContent = state.temp.toFixed(1);
    modeEl.textContent = mode();
    ctx.status(
      `${state.temp.toFixed(1)} °C · ${mode().toLowerCase()} · dial ${state.pressed ? 'pressed in' : 'raised'} · light ${state.orbit ? 'orbiting' : 'fixed top-left'} · ${state.night ? 'night' : 'day'} surface`,
    );
  }

  ctx.actions({
    cooler() {
      state.temp = Math.max(MIN, state.temp - 0.5);
      sync();
    },
    warmer() {
      state.temp = Math.min(MAX, state.temp + 0.5);
      sync();
    },
    press(button) {
      state.pressed = !state.pressed;
      button.setAttribute('aria-pressed', String(state.pressed));
      sync();
    },
    light(button) {
      state.orbit = !state.orbit;
      button.setAttribute('aria-pressed', String(state.orbit));
      sync();
    },
    theme(button) {
      state.night = !state.night;
      button.setAttribute('aria-pressed', String(state.night));
      sync();
    },
  });

  ctx.loop(({ dt }) => {
    if (state.orbit) angle += 0.35 * dt;
    else {
      const rest = Math.round((angle - Math.PI / 4) / (Math.PI * 2)) * Math.PI * 2 + Math.PI / 4;
      angle = dt ? approach(angle, rest, 3, dt) : rest;
    }
    const dist = 9;
    root.style.setProperty('--lx', (Math.cos(angle) * dist).toFixed(2));
    root.style.setProperty('--ly', (Math.sin(angle) * dist).toFixed(2));

    shown = dt ? approach(shown, state.temp, 8, dt) : state.temp;
    const t = (shown - MIN) / (MAX - MIN);
    marker.style.transform = `rotate(${(-135 + t * 270).toFixed(2)}deg)`;
    meter.style.width = `${(8 + t * 92).toFixed(2)}%`;
  });

  sync();
}
