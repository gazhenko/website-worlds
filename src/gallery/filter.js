// Pure gallery search/filter logic (unit-tested in Node).

export function searchText(world) {
  return [world.label, world.id, world.tagline, world.description, world.family, ...(world.tags ?? [])]
    .join(' ')
    .toLowerCase();
}

/** Every whitespace-separated term must match (AND); family 'all' disables the family filter. */
export function filterWorlds(worlds, { q = '', family = 'all' } = {}) {
  const terms = String(q ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return worlds.filter((world) => {
    if (family && family !== 'all' && world.family !== family) return false;
    if (terms.length === 0) return true;
    const haystack = searchText(world);
    return terms.every((term) => haystack.includes(term));
  });
}
