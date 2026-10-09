// Tiny DOM/string helpers shared by the shell and every world.
// Nothing here touches `document` at import time, so modules stay importable in Node tests.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a value for safe interpolation into HTML text or attribute values. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** Zero-pad a number: pad(7) → "07". */
export function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

/** Return the item after `current` in `list`, wrapping around. */
export function cycle(list, current) {
  const i = list.indexOf(current);
  return list[(i + 1) % list.length];
}

/** Mark exactly one button in a group as pressed. */
export function pressOne(buttons, active) {
  for (const b of buttons) b.setAttribute('aria-pressed', String(b === active));
}

/** Set the visible value label inside an action button: <span data-value>…</span>. */
export function setValue(root, action, text) {
  const el = root.querySelector(`[data-world-action="${action}"] [data-value]`);
  if (el) el.textContent = text;
}

/** Build a DOM element from an HTML string (first element only). */
export function fromHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
