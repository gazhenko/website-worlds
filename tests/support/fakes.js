// Small deterministic fakes for the browser APIs the runtime touches.

export function fakeScheduler() {
  let nextId = 1;
  const rafs = new Map();
  const timeouts = new Map();
  const intervals = new Map();
  return {
    raf(cb) {
      const id = nextId++;
      rafs.set(id, cb);
      return id;
    },
    caf(id) {
      rafs.delete(id);
    },
    setTimeout(fn) {
      const id = nextId++;
      timeouts.set(id, fn);
      return id;
    },
    clearTimeout(id) {
      timeouts.delete(id);
    },
    setInterval(fn) {
      const id = nextId++;
      intervals.set(id, fn);
      return id;
    },
    clearInterval(id) {
      intervals.delete(id);
    },
    flushFrame(now) {
      const callbacks = Array.from(rafs.values());
      rafs.clear();
      for (const cb of callbacks) cb(now);
      return callbacks.length;
    },
    tickIntervals() {
      for (const fn of Array.from(intervals.values())) fn();
    },
    fireTimeouts() {
      const fns = Array.from(timeouts.values());
      timeouts.clear();
      for (const fn of fns) fn();
    },
    get pendingFrames() {
      return rafs.size;
    },
    get pendingTimeouts() {
      return timeouts.size;
    },
    get pendingIntervals() {
      return intervals.size;
    },
  };
}

export function fakeEventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    dispatch(type, event = {}) {
      for (const fn of Array.from(listeners.get(type) ?? [])) fn(event);
    },
    count() {
      let n = 0;
      for (const set of listeners.values()) n += set.size;
      return n;
    },
  };
}

export function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    map,
  };
}

export function fakeMedia(matches) {
  const target = fakeEventTarget();
  return {
    matches,
    addEventListener: target.addEventListener,
    removeEventListener: target.removeEventListener,
    change(next) {
      this.matches = next;
      target.dispatch('change', { matches: next });
    },
    count: () => target.count(),
  };
}

export function fakeDocument(hidden = false) {
  const target = fakeEventTarget();
  return {
    hidden,
    addEventListener: target.addEventListener,
    removeEventListener: target.removeEventListener,
    setHidden(next) {
      this.hidden = next;
      target.dispatch('visibilitychange', {});
    },
    count: () => target.count(),
  };
}
