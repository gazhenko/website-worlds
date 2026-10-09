import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, worldHash, galleryHash, neighbors, slugify } from '../src/router.js';
import { worlds, families } from '../src/worlds/registry.js';

const route = (hash) => parseRoute(hash, worlds, families);

test('empty, bare and root hashes open the gallery without redirects', () => {
  for (const hash of ['', '#', '#/']) {
    const r = route(hash);
    assert.equal(r.name, 'gallery', hash);
    assert.deepEqual(r.query, { q: '', family: 'all' });
    assert.equal(r.redirect, null, `no redirect for "${hash}"`);
  }
});

test('gallery query parameters are parsed and canonicalised', () => {
  const r = route('#/?q=neon&family=retro');
  assert.equal(r.name, 'gallery');
  assert.deepEqual(r.query, { q: 'neon', family: 'retro' });
  assert.equal(r.redirect, null);

  const unknown = route('#/?family=nonsense');
  assert.equal(unknown.query.family, 'all', 'unknown family falls back to all');
  assert.equal(unknown.redirect, '#/');

  const empty = route('#/?q=');
  assert.equal(empty.redirect, '#/');

  const long = route(`#/?q=${'x'.repeat(200)}`);
  assert.equal(long.query.q.length, 80, 'search text is capped');
});

test('galleryHash round-trips through parseRoute', () => {
  for (const query of [
    { q: '', family: 'all' },
    { q: 'paper', family: 'all' },
    { q: 'neon sign', family: 'retro' },
    { q: '', family: 'dimension' },
  ]) {
    const hash = galleryHash(query);
    const r = route(hash);
    assert.deepEqual(r.query, query);
    assert.equal(r.redirect, null, hash);
  }
  assert.equal(galleryHash(), '#/');
});

test('canonical world routes resolve with their index', () => {
  const r = route('#/world/synthwave');
  assert.equal(r.name, 'world');
  assert.equal(r.id, 'synthwave');
  assert.equal(r.world.label, 'Synthwave');
  assert.equal(r.index, worlds.findIndex((w) => w.id === 'synthwave'));
  assert.equal(r.redirect, null);
});

test('non-canonical world routes redirect to the canonical hash', () => {
  const cases = {
    '#/world/SYNTHWAVE': '#/world/synthwave',
    '#/world/synthwave/': '#/world/synthwave',
    '#world/synthwave': '#/world/synthwave',
    '#/world/Neo%20Brutalism': '#/world/neo-brutalism',
    '#/world/ascil-art': '#/world/ascii-art',
    '#/world/Y2K%20Aesthetic': '#/world/y2k-aesthetic',
  };
  for (const [hash, canonical] of Object.entries(cases)) {
    const r = route(hash);
    assert.equal(r.name, 'world', hash);
    assert.equal(r.redirect, canonical, hash);
  }
});

test('unknown or malformed paths are not-found, never a crash', () => {
  for (const hash of ['#/world', '#/world/', '#/world/unknown-world', '#/world/a/b', '#/elsewhere', '#ww-main', '#/world/%E0%A4%A', '#/%%%']) {
    const r = route(hash);
    assert.equal(r.name, 'not-found', hash);
    assert.equal(r.redirect, null);
  }
});

test('neighbors wrap around at both ends', () => {
  assert.deepEqual(neighbors(0, 39), { prev: 38, next: 1 });
  assert.deepEqual(neighbors(38, 39), { prev: 37, next: 0 });
  assert.deepEqual(neighbors(0, 1), { prev: 0, next: 0 });
  assert.throws(() => neighbors(-1, 39), RangeError);
  assert.throws(() => neighbors(39, 39), RangeError);
  assert.throws(() => neighbors(1.5, 39), RangeError);
  assert.throws(() => neighbors(0, 0), RangeError);
});

test('stepping next 39 times from any world visits every world once', () => {
  const seen = new Set();
  let i = 0;
  for (let n = 0; n < worlds.length; n++) {
    seen.add(worlds[i].id);
    i = neighbors(i, worlds.length).next;
  }
  assert.equal(seen.size, worlds.length);
  assert.equal(i, 0);
});

test('worldHash and slugify are stable', () => {
  assert.equal(worldHash('art-deco'), '#/world/art-deco');
  assert.equal(slugify('Café & Crème Brûlée'), 'cafe-and-creme-brulee');
  assert.equal(slugify('  Wireframe 3D  '), 'wireframe-3d');
});
