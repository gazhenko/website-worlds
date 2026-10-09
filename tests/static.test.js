// Repository-level guarantees: self-contained runtime, base-aware build, CI wiring, hygiene.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { worlds } from '../src/worlds/registry.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) out.push(...(await walk(`${path}/`)));
    else out.push(path);
  }
  return out;
}

const ALLOWED_URLS = new Set(['http://www.w3.org/2000/svg', 'https://github.com/gazhenko/website-worlds']);

test('runtime sources reference no remote hosts (no CDNs, fonts, trackers or hotlinks)', async () => {
  const files = [...(await walk('src/')), ...(await walk('public/')), 'index.html'];
  assert.ok(files.length > 80, 'walked the source tree');
  for (const file of files) {
    const text = await read(file);
    for (const [url] of text.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
      assert.ok(ALLOWED_URLS.has(url), `${file} references ${url}`);
    }
    assert.doesNotMatch(text, /googleapis|gstatic|cdnjs|unpkg|jsdelivr|analytics|gtag\(|fbq\(/i, `${file} has a third-party dependency`);
  }
});

test('index.html is a base-aware, script-safe entry point', async () => {
  const html = await read('index.html');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1/);
  assert.match(html, /<script type="module" src="\/src\/main\.js"><\/script>/);
  assert.match(html, /Content-Security-Policy[^>]*default-src 'self'/);
  assert.match(html, /script-src 'self'/);
  assert.doesNotMatch(html, /<script(?![^>]*type="module")[^>]*>/, 'no classic inline scripts');
  assert.match(html, /id="app"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<noscript>/);
});

test('vite builds for the /website-worlds/ GitHub Pages base path', async () => {
  const config = await read('vite.config.js');
  assert.match(config, /base:\s*'\/website-worlds\/'/);
});

test('package.json is an ESM project with the required scripts and no runtime dependencies', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.type, 'module');
  for (const script of ['dev', 'build', 'preview', 'test']) assert.ok(pkg.scripts[script], `missing ${script}`);
  assert.match(pkg.scripts.test, /node --test/);
  assert.ok(pkg.devDependencies.vite, 'vite is a devDependency');
  assert.equal(pkg.dependencies, undefined, 'no runtime dependencies');
  assert.equal(pkg.license, undefined, 'no invented licence claim');
});

test('the Pages workflow builds with Node 22 and deploys only from main', async () => {
  const wf = await read('.github/workflows/pages.yml');
  for (const needle of [
    'branches: [main]',
    'workflow_dispatch:',
    'contents: read',
    'pages: write',
    'id-token: write',
    'concurrency:',
    'group: pages',
    'node-version: 22',
    'run: npm ci',
    'run: npm test',
    'run: npm run build',
    'actions/configure-pages@',
    'actions/upload-pages-artifact@',
    'actions/deploy-pages@',
    'path: dist',
  ]) {
    assert.ok(wf.includes(needle), `workflow is missing "${needle}"`);
  }
  assert.doesNotMatch(wf, /secrets\./, 'no secrets required');
  assert.doesNotMatch(wf, /pull_request/, 'no deploys from pull requests');
});

test('.gitignore keeps dependencies, builds, env files and evidence out of git', async () => {
  const ignore = await read('.gitignore');
  for (const entry of ['node_modules/', 'dist/', '*.log', '.env', 'playwright-report/', 'test-results/', '.claude/']) {
    assert.ok(ignore.split('\n').includes(entry), `.gitignore missing ${entry}`);
  }
});

test('the README documents every world by its exact label', async () => {
  const readme = await read('README.md');
  for (const w of worlds) {
    assert.ok(readme.includes(`| ${w.label} |`) || readme.includes(`### ${w.label}`), `README lacks ${w.label}`);
    for (const c of w.controls) assert.ok(readme.includes(c.label), `README lacks control "${c.label}" for ${w.label}`);
  }
  for (const cmd of ['npm ci', 'npm run dev', 'npm test', 'npm run build', 'npm run preview']) {
    assert.ok(readme.includes(cmd), `README lacks ${cmd}`);
  }
  assert.match(readme, /\/website-worlds\//);
});

test('every world has exactly one module and one stylesheet on disk', async () => {
  const files = new Set(await readdir(new URL('src/worlds/', root)));
  for (const w of worlds) {
    assert.ok(files.has(`${w.id}.js`), `${w.id}.js`);
    assert.ok(files.has(`${w.id}.css`), `${w.id}.css`);
  }
  const modules = [...files].filter((f) => f.endsWith('.js') && f !== 'registry.js');
  assert.equal(modules.length, worlds.length, 'no orphaned or extra world modules');
});

test('the global motion contract exists in CSS', async () => {
  const css = await read('src/styles/base.css');
  assert.match(css, /html\[data-motion='paused'\] \*/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
});
