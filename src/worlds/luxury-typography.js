import './luxury-typography.css';
import { esc } from '../lib/dom.js';

const WORDS = [
  { word: 'Nocturne', gloss: 'a quiet composition for the hours after dark' },
  { word: 'Atelier', gloss: 'a workroom where patience is the main material' },
  { word: 'Velours', gloss: 'the hush of a deep pile beneath the hand' },
  { word: 'Opaline', gloss: 'milky glass that keeps a little of the light' },
  { word: 'Sérénade', gloss: 'music offered beneath a window, expecting nothing' },
];
const TRACKING = [
  { id: 'classic', name: 'Classic' },
  { id: 'airy', name: 'Airy' },
  { id: 'tight', name: 'Tight' },
];

const letters = (word) =>
  Array.from(word)
    .map((ch, i) => `<span class="w-lux__ch" style="--i:${i}">${esc(ch)}</span>`)
    .join('');

export function render({ world }) {
  const first = WORDS[0];
  return `
  <div class="w-lux__frame">
    <header class="w-lux__top">
      <p class="w-lux__maison">Maison Ombre</p>
      <h1 class="w-lux__h1">${esc(world.label)}</h1>
      <p class="w-lux__season">Automne · MMXXVI</p>
    </header>
    <div class="w-lux__stage">
      <span class="w-lux__rule" aria-hidden="true"></span>
      <p class="w-lux__collection">Collection N° <span data-no>01</span></p>
      <p class="w-lux__word" data-word-wrap>
        <span class="ww-vh" data-word-text>${esc(first.word)}</span>
        <span class="w-lux__letters is-entering" aria-hidden="true" data-letters>${letters(first.word)}</span>
      </p>
      <p class="w-lux__gloss" data-gloss>— ${esc(first.gloss)} —</p>
      <span class="w-lux__rule w-lux__rule--glint" aria-hidden="true"><span></span></span>
    </div>
    <footer class="w-lux__foot">
      <p class="ww-caption w-lux__caption">${esc(world.description)}</p>
      <div class="w-lux__controls" role="group" aria-label="Typography controls">
        <button type="button" data-world-action="word">Next word</button>
        <button type="button" data-world-action="style" aria-pressed="false">Italic</button>
        <button type="button" data-world-action="tracking">Tracking · <span data-value>Classic</span></button>
      </div>
      <p class="w-lux__status" data-world-status role="status">Nocturne · roman · classic tracking</p>
    </footer>
  </div>`;
}

export function mount(root, ctx) {
  const lettersEl = root.querySelector('[data-letters]');
  const wordText = root.querySelector('[data-word-text]');
  const gloss = root.querySelector('[data-gloss]');
  const no = root.querySelector('[data-no]');
  const state = { word: 0, italic: false, tracking: 0 };

  function sync() {
    root.dataset.style = state.italic ? 'italic' : 'roman';
    root.dataset.tracking = TRACKING[state.tracking].id;
    root.querySelector('[data-world-action="tracking"] [data-value]').textContent = TRACKING[state.tracking].name;
    no.textContent = String(state.word + 1).padStart(2, '0');
    ctx.status(`${WORDS[state.word].word} · ${state.italic ? 'italic' : 'roman'} · ${TRACKING[state.tracking].name.toLowerCase()} tracking`);
  }

  ctx.actions({
    word() {
      state.word = (state.word + 1) % WORDS.length;
      const { word, gloss: g } = WORDS[state.word];
      lettersEl.classList.remove('is-entering');
      lettersEl.innerHTML = letters(word);
      void lettersEl.offsetWidth;
      lettersEl.classList.add('is-entering');
      wordText.textContent = word;
      gloss.textContent = `— ${g} —`;
      sync();
    },
    style(button) {
      state.italic = !state.italic;
      button.setAttribute('aria-pressed', String(state.italic));
      sync();
    },
    tracking() {
      state.tracking = (state.tracking + 1) % TRACKING.length;
      sync();
    },
  });

  sync();
}
