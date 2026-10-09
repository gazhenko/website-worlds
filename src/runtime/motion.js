// Global motion controller.
//
// Motion is "running" only when the visitor has not paused it AND the page is visible.
// The initial paused state honours `prefers-reduced-motion: reduce`; an explicit choice made
// with the Pause/Resume control is remembered (localStorage) and wins over the system setting.

export const MOTION_STORAGE_KEY = 'website-worlds:motion';

function readPreference(storage) {
  try {
    const value = storage?.getItem(MOTION_STORAGE_KEY);
    return value === 'paused' || value === 'running' ? value : null;
  } catch {
    return null;
  }
}

function writePreference(storage, value) {
  try {
    if (value === null) storage?.removeItem(MOTION_STORAGE_KEY);
    else storage?.setItem(MOTION_STORAGE_KEY, value);
  } catch {
    /* storage may be unavailable (private mode); the in-memory state still works */
  }
}

export function createMotionController({ storage = null, media = null, doc = null } = {}) {
  let reduced = Boolean(media && media.matches);
  let preference = readPreference(storage);
  let paused = preference ? preference === 'paused' : reduced;
  let hidden = Boolean(doc && doc.hidden);
  const subscribers = new Set();

  const getState = () => ({
    paused,
    reduced,
    hidden,
    running: !paused && !hidden,
    source: preference ? 'user' : reduced ? 'system' : 'default',
  });

  const emit = () => {
    const state = getState();
    for (const fn of Array.from(subscribers)) fn(state);
  };

  const api = {
    getState,
    get running() {
      return !paused && !hidden;
    },
    setPaused(next) {
      const value = Boolean(next);
      preference = value ? 'paused' : 'running';
      writePreference(storage, preference);
      if (value !== paused) {
        paused = value;
        emit();
      }
    },
    toggle() {
      api.setPaused(!paused);
    },
    setReduced(next) {
      reduced = Boolean(next);
      if (!preference) paused = reduced;
      emit();
    },
    setHidden(next) {
      const value = Boolean(next);
      if (value === hidden) return;
      hidden = value;
      emit();
    },
    resetPreference() {
      preference = null;
      writePreference(storage, null);
      paused = reduced;
      emit();
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    /** Listen to the reduced-motion media query and page visibility. Returns a disconnect fn. */
    connect(documentRef = doc) {
      const offs = [];
      if (media) {
        const onChange = (event) => api.setReduced(event.matches);
        if (typeof media.addEventListener === 'function') {
          media.addEventListener('change', onChange);
          offs.push(() => media.removeEventListener('change', onChange));
        } else if (typeof media.addListener === 'function') {
          media.addListener(onChange);
          offs.push(() => media.removeListener(onChange));
        }
      }
      if (documentRef && typeof documentRef.addEventListener === 'function') {
        const onVisibility = () => api.setHidden(documentRef.hidden);
        documentRef.addEventListener('visibilitychange', onVisibility);
        offs.push(() => documentRef.removeEventListener('visibilitychange', onVisibility));
      }
      return () => offs.splice(0).forEach((off) => off());
    },
  };
  return api;
}
