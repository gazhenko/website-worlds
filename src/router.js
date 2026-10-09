// Hash router. Routes:
//   #/                       → gallery (optional ?q=<search>&family=<id>)
//   #/world/<id>             → a world (aliases and label-style slugs redirect to the canonical id)
//   anything else            → not-found
// Hash routes keep GitHub Pages deep links working with no server-side rewrites.

export function slugify(label) {
  return String(label)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const worldHash = (id) => `#/world/${id}`;

export function galleryHash({ q = '', family = 'all' } = {}) {
  const params = new URLSearchParams();
  const query = String(q ?? '').trim();
  if (query) params.set('q', query);
  if (family && family !== 'all') params.set('family', family);
  const search = params.toString();
  return search ? `#/?${search}` : '#/';
}

export function neighbors(index, total) {
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(index) || index < 0 || index >= total) {
    throw new RangeError(`neighbors: index ${index} is outside 0..${total - 1}`);
  }
  return { prev: (index - 1 + total) % total, next: (index + 1) % total };
}

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function findWorldIndex(worlds, slug) {
  const wanted = slug.trim().toLowerCase();
  let index = worlds.findIndex((w) => w.id === wanted);
  if (index === -1) index = worlds.findIndex((w) => (w.aliases ?? []).includes(wanted));
  if (index === -1) {
    const loose = slugify(wanted);
    if (loose) index = worlds.findIndex((w) => w.id === loose || slugify(w.label) === loose || (w.aliases ?? []).includes(loose));
  }
  return index;
}

/**
 * Parse a location hash. Returns one of:
 *   { name: 'gallery', query: { q, family }, redirect }
 *   { name: 'world', id, index, world, redirect }
 *   { name: 'not-found', path, redirect: null }
 * `redirect` is the canonical hash when the input should be normalised (or null).
 */
export function parseRoute(hash, worlds, families = null) {
  let raw = String(hash ?? '');
  if (raw.startsWith('#')) raw = raw.slice(1);
  const qIndex = raw.indexOf('?');
  const pathPart = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const queryPart = qIndex === -1 ? '' : raw.slice(qIndex + 1);
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const segments = path.split('/').filter(Boolean).map(safeDecode);

  if (segments.length === 0) {
    const params = new URLSearchParams(queryPart);
    const q = (params.get('q') ?? '').slice(0, 80);
    let family = params.get('family') ?? 'all';
    if (family !== 'all' && Array.isArray(families) && !families.some((f) => f.id === family)) family = 'all';
    const query = { q, family };
    const canonical = galleryHash(query);
    const redirect = raw === '' || `#${raw}` === canonical ? null : canonical;
    return { name: 'gallery', query, redirect };
  }

  if (segments.length === 2 && segments[0].toLowerCase() === 'world') {
    const index = findWorldIndex(worlds, segments[1]);
    if (index !== -1) {
      const world = worlds[index];
      const canonical = worldHash(world.id);
      return { name: 'world', id: world.id, index, world, redirect: `#${raw}` === canonical ? null : canonical };
    }
  }

  return { name: 'not-found', path, redirect: null };
}
