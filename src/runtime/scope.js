// A scope owns everything a view starts — animation loops, timers, listeners and observers —
// and tears all of it down in destroy(). Worlds receive a scope as `ctx` and never call
// requestAnimationFrame/setInterval/addEventListener directly, so nothing leaks between routes.
//
// Motion contract:
//   • loop(fn) callbacks run every frame while motion is running (dt > 0, time advances).
//   • While paused (manual pause, reduced motion, or hidden page) the rAF loop stops entirely.
//     A single still frame (dt = 0) is still drawn after redraw(), an action, a resize or a
//     motion change, so controls keep visibly working while motion is paused.
//   • every(ms, fn) intervals skip their callbacks while paused.

const browserScheduler = () => ({
  raf: (cb) => globalThis.requestAnimationFrame(cb),
  caf: (id) => globalThis.cancelAnimationFrame(id),
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (id) => globalThis.clearTimeout(id),
  setInterval: (fn, ms) => globalThis.setInterval(fn, ms),
  clearInterval: (id) => globalThis.clearInterval(id),
});

function report(error) {
  globalThis.console?.error?.('[website-worlds]', error);
}

export function createScope({ root = null, motion, world = null, scheduler = browserScheduler(), maxDpr = 2 } = {}) {
  if (!motion || typeof motion.getState !== 'function') {
    throw new TypeError('createScope requires a motion controller');
  }

  const loops = new Set();
  const motionListeners = new Set();
  const timeouts = new Set();
  const intervals = new Set();
  const cleanups = [];
  let rafId = null;
  let lastNow = 0;
  let time = 0;
  let wantsFrame = false;
  let alive = true;

  const isRunning = () => motion.getState().running;

  function tick(now) {
    rafId = null;
    if (!alive) return;
    const running = isRunning();
    let dt = 0;
    if (running) {
      if (lastNow) dt = Math.min(Math.max((now - lastNow) / 1000, 0), 0.066);
      lastNow = now;
      time += dt;
    } else {
      lastNow = 0;
    }
    wantsFrame = false;
    const frame = { dt, time, running, now };
    for (const fn of Array.from(loops)) {
      try {
        fn(frame);
      } catch (error) {
        loops.delete(fn);
        report(error);
      }
    }
    schedule();
  }

  function schedule() {
    if (!alive || rafId !== null || loops.size === 0) return;
    if (isRunning() || wantsFrame) rafId = scheduler.raf(tick);
  }

  const unsubscribe = motion.subscribe((state) => {
    if (!alive) return;
    for (const fn of Array.from(motionListeners)) {
      try {
        fn(state);
      } catch (error) {
        report(error);
      }
    }
    wantsFrame = true;
    schedule();
  });

  const scope = {
    root,
    world,
    get alive() {
      return alive;
    },
    get running() {
      return isRunning();
    },
    get paused() {
      return motion.getState().paused;
    },
    get reduced() {
      return motion.getState().reduced;
    },
    get time() {
      return time;
    },
    /** Hidden or pending frames: true while a rAF is scheduled (exposed for tests). */
    get scheduled() {
      return rafId !== null;
    },

    loop(fn) {
      loops.add(fn);
      wantsFrame = true;
      schedule();
      return () => loops.delete(fn);
    },

    redraw() {
      wantsFrame = true;
      schedule();
    },

    every(ms, fn, { whilePaused = false } = {}) {
      if (!alive) return () => {};
      const id = scheduler.setInterval(() => {
        if (alive && (whilePaused || isRunning())) fn();
      }, ms);
      intervals.add(id);
      return () => {
        if (intervals.delete(id)) scheduler.clearInterval(id);
      };
    },

    after(ms, fn) {
      if (!alive) return () => {};
      const id = scheduler.setTimeout(() => {
        timeouts.delete(id);
        if (alive) fn();
      }, ms);
      timeouts.add(id);
      return () => {
        if (timeouts.delete(id)) scheduler.clearTimeout(id);
      };
    },

    on(target, type, handler, options) {
      if (!alive || !target || typeof target.addEventListener !== 'function') return () => {};
      target.addEventListener(type, handler, options);
      let active = true;
      const off = () => {
        if (!active) return;
        active = false;
        target.removeEventListener(type, handler, options);
      };
      cleanups.push(off);
      return off;
    },

    onMotion(fn, { immediate = true } = {}) {
      motionListeners.add(fn);
      if (immediate) fn(motion.getState());
      return () => motionListeners.delete(fn);
    },

    onResize(el, fn) {
      if (!alive || !el) return;
      if (typeof globalThis.ResizeObserver === 'function') {
        const observer = new globalThis.ResizeObserver(() => {
          if (alive) fn();
        });
        observer.observe(el);
        cleanups.push(() => observer.disconnect());
      } else {
        scope.on(globalThis, 'resize', () => fn());
      }
    },

    onCleanup(fn) {
      if (typeof fn === 'function') cleanups.push(fn);
    },

    /** Delegate clicks on [data-world-action] buttons inside root to the matching handler. */
    actions(map) {
      if (!root) return;
      scope.on(root, 'click', (event) => {
        const target = event.target;
        const button = target && typeof target.closest === 'function' ? target.closest('[data-world-action]') : null;
        if (!button || (typeof root.contains === 'function' && !root.contains(button))) return;
        if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;
        const name = button.getAttribute('data-world-action');
        const handler = map[name];
        if (typeof handler !== 'function') return;
        handler(button, event);
        scope.redraw();
      });
    },

    /** Update the world's visible state indicator ([data-world-status]). */
    status(text) {
      const el = root?.querySelector?.('[data-world-status]');
      if (el && el.textContent !== text) el.textContent = text;
    },

    /**
     * Prepare a 2D canvas that tracks its CSS size at a capped device-pixel ratio.
     * Returns a view { g, el, w, h, dpr } or null when Canvas 2D is unavailable, in which case
     * the world's [data-canvas-fallback] element is revealed.
     */
    canvas(el, { maxDpr: cap = maxDpr, alpha = true, onResize } = {}) {
      let g = null;
      try {
        g = el.getContext('2d', { alpha });
      } catch {
        g = null;
      }
      if (!g) {
        root?.classList?.add('is-canvas-fallback');
        root?.querySelectorAll?.('[data-canvas-fallback]').forEach((node) => {
          node.hidden = false;
        });
        return null;
      }
      const view = { g, el, w: 0, h: 0, dpr: 1 };
      const resize = () => {
        const rect = el.getBoundingClientRect();
        const dpr = Math.min(globalThis.devicePixelRatio || 1, cap);
        const w = Math.max(1, Math.round(rect.width));
        const h = Math.max(1, Math.round(rect.height));
        if (w === view.w && h === view.h && dpr === view.dpr) return;
        view.w = w;
        view.h = h;
        view.dpr = dpr;
        el.width = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        onResize?.(view);
        scope.redraw();
      };
      scope.onResize(el, resize);
      resize();
      return view;
    },

    destroy() {
      if (!alive) return;
      alive = false;
      if (rafId !== null) scheduler.caf(rafId);
      rafId = null;
      loops.clear();
      motionListeners.clear();
      unsubscribe();
      for (const id of timeouts) scheduler.clearTimeout(id);
      timeouts.clear();
      for (const id of intervals) scheduler.clearInterval(id);
      intervals.clear();
      while (cleanups.length) {
        const fn = cleanups.pop();
        try {
          fn();
        } catch (error) {
          report(error);
        }
      }
    },

    /** Counts of live resources — used by tests to prove teardown. */
    stats() {
      return {
        loops: loops.size,
        timeouts: timeouts.size,
        intervals: intervals.size,
        cleanups: cleanups.length,
        scheduled: rafId !== null,
      };
    },
  };

  return scope;
}
