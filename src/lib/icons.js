// Original 20×20 line icons for the shell UI.
const PATHS = {
  atlas: '<rect x="3" y="3" width="5.5" height="5.5" rx="1.2"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.2"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.2"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.2"/>',
  prev: '<path d="M12.5 4 6.5 10l6 6"/>',
  next: '<path d="m7.5 4 6 6-6 6"/>',
  pause: '<rect x="5.5" y="4" width="3" height="12" rx="1" fill="currentColor" stroke="none"/><rect x="11.5" y="4" width="3" height="12" rx="1" fill="currentColor" stroke="none"/>',
  play: '<path d="M6.5 4.2v11.6a.6.6 0 0 0 .9.5l9.2-5.8a.6.6 0 0 0 0-1L7.4 3.7a.6.6 0 0 0-.9.5Z" fill="currentColor" stroke="none"/>',
  link: '<path d="M8.6 11.4a3.4 3.4 0 0 0 4.8 0l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8L10 5.2"/><path d="M11.4 8.6a3.4 3.4 0 0 0-4.8 0L4 11.2A3.4 3.4 0 0 0 8.8 16l1.2-1.2"/>',
  check: '<path d="m4 10.5 4 4 8-9"/>',
  search: '<circle cx="8.8" cy="8.8" r="5.3"/><path d="m12.8 12.8 4.2 4.2"/>',
  shuffle: '<path d="M3 6h2.5c4.5 0 5.5 8 10 8H17M3 14h2.5c1.6 0 2.7-1 3.5-2.3M11 7.6C12 6.6 13.2 6 15 6h2M15 3.6 17.4 6 15 8.4M15 11.6l2.4 2.4-2.4 2.4"/>',
  arrow: '<path d="M4 10h12M11 5l5 5-5 5"/>',
  compass: '<circle cx="10" cy="10" r="7"/><path d="m12.8 7.2-1.6 4-4 1.6 1.6-4 4-1.6Z" fill="currentColor" stroke="none"/>',
};

export function icon(name, size = 18) {
  return `<svg class="ww-icon" viewBox="0 0 20 20" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name] ?? ''}</svg>`;
}
