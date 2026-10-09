// Per-world renderer coverage: every registry entry must load a real module whose render()
// produces a complete, accessible world and whose mount() wires every declared action.
import { register } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { esc } from '../src/lib/dom.js';
import { worlds } from '../src/worlds/registry.js';

register('./support/css-hooks.js', import.meta.url);

const srcUrl = (file) => new URL(`../src/worlds/${file}`, import.meta.url);
const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (text) =>
  text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Collect style-rule selectors from a stylesheet, skipping @keyframes bodies. */
function selectorsOf(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [];
  let i = 0;
  let prelude = '';
  const stack = [];
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      const p = prelude.trim();
      prelude = '';
      if (p.startsWith('@keyframes')) {
        let depth = 1;
        i += 1;
        while (i < text.length && depth > 0) {
          if (text[i] === '{') depth += 1;
          else if (text[i] === '}') depth -= 1;
          i += 1;
        }
        continue;
      }
      if (p.startsWith('@')) stack.push('at');
      else {
        stack.push('rule');
        selectors.push(...p.split(',').map((s) => s.trim()));
      }
    } else if (ch === '}') {
      stack.pop();
      prelude = '';
    } else if (ch === ';') {
      prelude = '';
    } else {
      prelude += ch;
    }
    i += 1;
  }
  return selectors;
}

const loaded = new Map();

for (const world of worlds) {
  test(`${world.label}: module loads and render() builds a complete world`, async () => {
    const mod = await world.renderer();
    loaded.set(world.id, mod);
    assert.equal(typeof mod.render, 'function', 'exports render()');
    assert.equal(typeof mod.mount, 'function', 'exports mount()');
    assert.ok(mod.mount.length >= 2, 'mount(root, ctx)');

    const html = mod.render({ world, index: worlds.indexOf(world), total: worlds.length });
    assert.equal(typeof html, 'string');
    assert.ok(html.length > 600, 'render output is substantial');

    const h1s = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) ?? [];
    assert.equal(h1s.length, 1, 'exactly one <h1>');
    assert.ok(decode(stripTags(h1s[0])).includes(world.label), `h1 contains the exact label "${world.label}"`);

    assert.match(html, /class="[^"]*\bww-caption\b[^"]*"/, 'has a .ww-caption caption');
    assert.ok(html.includes(esc(world.description)), 'caption shows the registry description');
    assert.match(html, /data-world-status[^>]*role="status"|role="status"[^>]*data-world-status/, 'has a role=status state indicator');

    const actionTags = [...html.matchAll(/<([a-zA-Z0-9-]+)\b([^>]*)\bdata-world-action="([^"]+)"([^>]*)>/g)];
    assert.ok(actionTags.length >= 1, 'renders at least one data-world-action control');
    for (const [, tag, before, , after] of actionTags) {
      assert.equal(tag.toLowerCase(), 'button', 'actions are real <button> elements');
      assert.match(before + after, /\btype="button"/, 'action buttons declare type="button"');
    }
    const rendered = new Set(actionTags.map((m) => m[3]));
    const declared = new Set(world.controls.map((c) => c.action));
    assert.deepEqual([...rendered].sort(), [...declared].sort(), 'rendered actions match registry controls');

    assert.doesNotMatch(html, /\b(?:src|href)=["']https?:/i, 'no remote resources in markup');
    assert.doesNotMatch(html, /<script\b/i, 'no inline scripts');
    assert.doesNotMatch(html, /<(?:input|form)\b[^>]*(?:email|password|card)/i, 'no fake signup/purchase forms');
  });

  test(`${world.label}: source wires every action through the lifecycle runtime`, async () => {
    const src = await readFile(srcUrl(`${world.id}.js`), 'utf8');
    assert.ok(src.includes(`import './${world.id}.css';`), 'imports its own stylesheet');
    const start = src.indexOf('ctx.actions({');
    assert.ok(start !== -1, 'calls ctx.actions({...})');
    const end = src.indexOf('\n  });', start);
    const block = src.slice(start, end === -1 ? undefined : end);
    for (const { action } of world.controls) {
      const re = new RegExp(`(^|\\n)\\s*['"]?${escapeRe(action)}['"]?\\s*(\\(|:)`);
      assert.match(block, re, `handler for "${action}" inside ctx.actions`);
    }
    for (const raw of ['requestAnimationFrame(', 'setInterval(', 'setTimeout(', '.addEventListener(']) {
      assert.equal(src.includes(raw), false, `uses ctx instead of raw ${raw}`);
    }
    assert.match(src, /ctx\.status\(/, 'updates its visible state indicator');
    assert.doesNotMatch(src, /\b(TODO|FIXME|lorem ipsum)\b/i, 'no stubs or placeholder copy');
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|new WebSocket/, 'no network access');
    assert.doesNotMatch(src, /new Audio\(|AudioContext|\.play\(\)/, 'no audio');
  });

  test(`${world.label}: stylesheet is scoped and self-contained`, async () => {
    const css = await readFile(srcUrl(`${world.id}.css`), 'utf8');
    const scope = `.w-${world.id}`;
    const selectors = selectorsOf(css);
    assert.ok(selectors.length >= 10, 'has a real stylesheet');
    for (const sel of selectors) {
      assert.ok(sel.startsWith(scope), `selector "${sel}" is scoped under ${scope}`);
    }
    for (const [, name] of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
      assert.ok(name.startsWith('w-'), `keyframes "${name}" is namespaced`);
    }
    assert.doesNotMatch(css, /url\(\s*['"]?https?:/i, 'no remote url() assets');
    assert.doesNotMatch(css, /@import|@font-face/i, 'no imported stylesheets or web fonts');
    assert.match(css, /--ww-focus/, 'declares an accessible focus colour');
  });
}

test('every world is a distinct module with its own markup and visual vocabulary', async () => {
  const mods = await Promise.all(worlds.map((w) => w.renderer()));
  assert.equal(new Set(mods).size, worlds.length, 'no two worlds share a module');
  assert.equal(new Set(mods.map((m) => m.render)).size, worlds.length, 'no shared render function');
  const prefixes = new Map();
  worlds.forEach((world, i) => {
    const html = mods[i].render({ world, index: i, total: worlds.length });
    const counts = new Map();
    for (const [, cls] of html.matchAll(/class="([^"]+)"/g)) {
      for (const token of cls.split(/\s+/)) {
        const m = token.match(/^(w-[a-z0-9]+)__/);
        if (m) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
      }
    }
    const [prefix, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    assert.ok(prefix && n >= 6, `${world.id} uses its own BEM vocabulary`);
    assert.equal(prefixes.has(prefix), false, `${world.id} shares class prefix ${prefix} with ${prefixes.get(prefix)}`);
    prefixes.set(prefix, world.id);
  });
});
