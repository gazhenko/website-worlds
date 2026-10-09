import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { worlds, families, worldIds, getWorld, familyLabel } from '../src/worlds/registry.js';
import { slugify, worldHash, parseRoute } from '../src/router.js';

const manifest = JSON.parse(await readFile(new URL('../styles.requested.json', import.meta.url), 'utf8'));

test('the acceptance manifest has exactly 39 labels', () => {
  assert.equal(manifest.length, 39);
  assert.equal(new Set(manifest).size, 39, 'manifest labels are unique');
});

test('registry labels equal the manifest exactly and in the same order', () => {
  assert.equal(worlds.length, manifest.length);
  assert.deepEqual(
    worlds.map((w) => w.label),
    manifest,
  );
});

test('the literal "ASCIl art" label is preserved, not silently corrected', () => {
  const entry = worlds.find((w) => w.label === 'ASCIl art');
  assert.ok(entry, 'ASCIl art is present with a lowercase L');
  assert.equal(
    worlds.some((w) => w.label === 'ASCII art'),
    false,
  );
  assert.equal(entry.id, 'ascii-art');
  assert.ok(entry.aliases.includes('ascil-art'), 'the label-derived slug is kept as an alias');
});

test('world ids are unique, URL-safe slugs', () => {
  assert.equal(new Set(worldIds).size, worlds.length);
  for (const id of worldIds) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad id ${id}`);
});

test('every route hash is unique and resolves back to its own world', () => {
  const hashes = worlds.map((w) => worldHash(w.id));
  assert.equal(new Set(hashes).size, worlds.length);
  worlds.forEach((w, i) => {
    const route = parseRoute(worldHash(w.id), worlds, families);
    assert.equal(route.name, 'world');
    assert.equal(route.id, w.id);
    assert.equal(route.index, i);
    assert.equal(route.redirect, null);
  });
});

test('every label-derived slug reaches its world (as id or alias)', () => {
  for (const w of worlds) {
    const slug = slugify(w.label);
    assert.ok(slug === w.id || w.aliases.includes(slug), `${w.label} → ${slug} does not map to ${w.id}`);
    const route = parseRoute(`#/world/${slug}`, worlds, families);
    assert.equal(route.id, w.id);
  }
});

test('aliases never collide with another world id', () => {
  const ids = new Set(worldIds);
  for (const w of worlds) for (const alias of w.aliases) assert.equal(ids.has(alias), false, `${alias} shadows an id`);
});

test('entries carry complete, meaningful metadata', () => {
  const familyIds = new Set(families.map((f) => f.id));
  for (const w of worlds) {
    assert.equal(typeof w.description, 'string');
    assert.ok(w.description.length >= 80 && w.description.length <= 320, `${w.id} description length ${w.description.length}`);
    assert.ok(/[.!]$/.test(w.description), `${w.id} description ends with punctuation`);
    assert.ok(w.tagline.length >= 15 && w.tagline.length <= 60, `${w.id} tagline length`);
    assert.ok(familyIds.has(w.family), `${w.id} has unknown family ${w.family}`);
    assert.match(w.accent, /^#[0-9a-f]{6}$/i);
    assert.ok(Array.isArray(w.tags) && w.tags.length >= 3, `${w.id} tags`);
    assert.equal(typeof w.renderer, 'function', `${w.id} renderer is a lazy loader`);
  }
});

test('descriptions are distinct — no template copy shared between worlds', () => {
  assert.equal(new Set(worlds.map((w) => w.description)).size, worlds.length);
  assert.equal(new Set(worlds.map((w) => w.tagline)).size, worlds.length);
});

test('every world declares at least one control with a unique, valid action name', () => {
  for (const w of worlds) {
    assert.ok(w.controls.length >= 1, `${w.id} has no controls`);
    const names = w.controls.map((c) => c.action);
    assert.equal(new Set(names).size, names.length, `${w.id} duplicate action`);
    for (const c of w.controls) {
      assert.match(c.action, /^[a-z][a-z0-9-]*$/);
      assert.ok(c.label.length > 1 && c.effect.length > 10, `${w.id}/${c.action} needs a label and effect`);
    }
  }
});

test('families are well-formed and every family is used', () => {
  assert.equal(new Set(families.map((f) => f.id)).size, families.length);
  for (const f of families) {
    assert.ok(worlds.some((w) => w.family === f.id), `${f.id} unused`);
    assert.equal(familyLabel(f.id), f.label);
  }
});

test('lookup helpers and immutability', () => {
  assert.equal(getWorld('synthwave').label, 'Synthwave');
  assert.equal(getWorld('nope'), null);
  assert.ok(Object.isFrozen(worlds));
  assert.ok(Object.isFrozen(worlds[0]));
  assert.throws(() => {
    worlds[0].label = 'Changed';
  }, TypeError);
});
