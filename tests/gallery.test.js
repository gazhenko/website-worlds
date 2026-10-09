import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterWorlds } from '../src/gallery/filter.js';
import { thumbFor, thumbIds } from '../src/gallery/thumbs.js';
import { renderGallery } from '../src/gallery/gallery.js';
import { worlds, families } from '../src/worlds/registry.js';

const ids = (list) => list.map((w) => w.id);

test('an empty search shows every world', () => {
  assert.equal(filterWorlds(worlds, { q: '', family: 'all' }).length, 39);
  assert.equal(filterWorlds(worlds).length, 39);
});

test('family filters partition the atlas', () => {
  let total = 0;
  for (const f of families) {
    const subset = filterWorlds(worlds, { family: f.id });
    assert.ok(subset.length > 0, f.id);
    assert.ok(subset.every((w) => w.family === f.id));
    total += subset.length;
  }
  assert.equal(total, 39);
});

test('search matches labels, tags and descriptions case-insensitively', () => {
  const clay = ids(filterWorlds(worlds, { q: 'CLAY' }));
  assert.ok(clay.includes('claymorphism') && clay.includes('clay-3d'));
  assert.ok(ids(filterWorlds(worlds, { q: 'neon' })).includes('neon-glow'));
  assert.ok(ids(filterWorlds(worlds, { q: 'kintsugi' })).includes('wabi-sabi'), 'tags are searchable');
  assert.ok(ids(filterWorlds(worlds, { q: 'ascii' })).includes('ascii-art'));
  assert.deepEqual(filterWorlds(worlds, { q: 'zzzz-no-such-world' }), []);
});

test('multiple terms narrow the results (AND) and combine with families', () => {
  const both = ids(filterWorlds(worlds, { q: 'neon sign' }));
  assert.ok(both.includes('neon-glow'));
  assert.ok(both.length < ids(filterWorlds(worlds, { q: 'neon' })).length || both.length === 1);
  assert.deepEqual(ids(filterWorlds(worlds, { q: 'clay', family: 'dimension' })), ['clay-3d']);
});

test('every world has original scene art for its gallery card', () => {
  assert.deepEqual([...thumbIds].sort(), worlds.map((w) => w.id).sort());
  for (const w of worlds) {
    const svg = thumbFor(w.id);
    assert.match(svg, /^<svg class="ww-thumb/, w.id);
    assert.match(svg, /viewBox="0 0 160 100"/);
    const shapes = svg.match(/<(rect|circle|ellipse|path|polygon|text|line)\b/g) ?? [];
    assert.ok(shapes.length >= 5, `${w.id} thumbnail is a scene, not a colour chip (${shapes.length} shapes)`);
    assert.doesNotMatch(svg, /https?:\/\/(?!www\.w3\.org)/, 'no remote references');
  }
  assert.equal(thumbFor('missing'), '');
});

test('thumbnail ids are unique page-wide and every url(#ref) resolves', () => {
  const all = worlds.map((w) => thumbFor(w.id)).join('');
  const defined = [...all.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(defined).size, defined.length, 'no duplicate ids across thumbnails');
  for (const w of worlds) {
    const svg = thumbFor(w.id);
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) {
      assert.match(svg, new RegExp(`id="${ref}"`), `${w.id} references #${ref}`);
      assert.ok(ref.startsWith('t-'), `${ref} is namespaced`);
    }
  }
});

test('the gallery renders a linked card for every world plus search and filters', () => {
  const html = renderGallery({ worlds, families, query: { q: '', family: 'all' }, surpriseId: 'bauhaus' });
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'one h1');
  assert.match(html, /<h2\b/);
  assert.equal((html.match(/data-ww-card="/g) ?? []).length, 39);
  for (const w of worlds) assert.ok(html.includes(`href="#/world/${w.id}"`), `card link for ${w.id}`);
  assert.match(html, /<label for="ww-search"[^>]*>/);
  assert.match(html, /<input id="ww-search" type="search"/);
  assert.equal((html.match(/data-ww-family="/g) ?? []).length, families.length + 1);
  assert.match(html, /href="#\/world\/bauhaus"[^>]*>[\s\S]*Surprise me/, 'surprise link is a real route');
  assert.match(html, /aria-pressed="true"[^>]*>\s*All worlds/);
});

test('a filtered gallery reflects its query in the markup', () => {
  const html = renderGallery({ worlds, families, query: { q: 'paper', family: 'print' }, surpriseId: 'scrapbook' });
  assert.match(html, /value="paper"/);
  assert.match(html, /data-ww-family="print" aria-pressed="true"/);
});
