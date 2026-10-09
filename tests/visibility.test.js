import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('hidden-page motion state disables CSS animation and transitions, including pseudo-elements', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/styles/base.css', import.meta.url), 'utf8');
  assert.match(app, /dataset\.pageHidden = String\(state\.hidden\)/);
  const stationaryRule = css.match(/([^{}]+)\{\s*animation: none !important;\s*transition: none !important;\s*scroll-behavior: auto !important;\s*\}/);
  assert.ok(stationaryRule, 'the shared stationary rule exists');
  for (const suffix of ['*', '*::before', '*::after']) {
    assert.ok(stationaryRule[1].includes(`html[data-page-hidden='true'] ${suffix}`), `hidden-page selector ${suffix} is present`);
  }
});
