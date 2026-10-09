import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMotionController, MOTION_STORAGE_KEY } from '../src/runtime/motion.js';
import { createScope } from '../src/runtime/scope.js';
import { fakeScheduler, fakeEventTarget, fakeStorage, fakeMedia, fakeDocument } from './support/fakes.js';

// ---------------------------------------------------------------- motion controller

test('motion runs by default and honours prefers-reduced-motion with a paused start', () => {
  assert.equal(createMotionController({ media: fakeMedia(false) }).getState().running, true);
  const reduced = createMotionController({ media: fakeMedia(true) }).getState();
  assert.equal(reduced.paused, true);
  assert.equal(reduced.running, false);
  assert.equal(reduced.source, 'system');
});

test('an explicit visitor choice is persisted and wins over the system setting', () => {
  const storage = fakeStorage();
  const motion = createMotionController({ storage, media: fakeMedia(true) });
  motion.toggle();
  assert.equal(motion.getState().paused, false);
  assert.equal(storage.getItem(MOTION_STORAGE_KEY), 'running');

  const again = createMotionController({ storage, media: fakeMedia(true) });
  assert.equal(again.getState().paused, false, 'stored "running" overrides reduced motion');
  assert.equal(again.getState().source, 'user');

  again.resetPreference();
  assert.equal(again.getState().paused, true, 'reset falls back to the system preference');
  assert.equal(storage.getItem(MOTION_STORAGE_KEY), null);
});

test('hidden pages are not running, and subscribers hear every change', () => {
  const doc = fakeDocument(false);
  const media = fakeMedia(false);
  const motion = createMotionController({ media, doc });
  const seen = [];
  const off = motion.subscribe((s) => seen.push(`${s.paused ? 'P' : 'R'}${s.hidden ? 'h' : ''}`));
  const disconnect = motion.connect(doc);
  doc.setHidden(true);
  assert.equal(motion.getState().running, false);
  doc.setHidden(false);
  media.change(true);
  assert.equal(motion.getState().paused, true, 'live reduced-motion change pauses when no preference stored');
  motion.setPaused(false);
  assert.deepEqual(seen, ['Rh', 'R', 'P', 'R']);
  off();
  disconnect();
  assert.equal(doc.count(), 0, 'visibility listener removed');
  assert.equal(media.count(), 0, 'media listener removed');
  motion.setPaused(true);
  assert.equal(seen.length, 4, 'unsubscribed listener is silent');
});

test('storage failures do not break motion control', () => {
  const broken = {
    getItem() {
      throw new Error('denied');
    },
    setItem() {
      throw new Error('denied');
    },
    removeItem() {
      throw new Error('denied');
    },
  };
  const motion = createMotionController({ storage: broken });
  motion.toggle();
  assert.equal(motion.getState().paused, true);
});

// ---------------------------------------------------------------- scope lifecycle

function setup({ reduced = false } = {}) {
  const scheduler = fakeScheduler();
  const motion = createMotionController({ media: fakeMedia(reduced) });
  const root = fakeEventTarget();
  root.contains = () => true;
  const scope = createScope({ root, motion, scheduler });
  return { scheduler, motion, root, scope };
}

test('loops run every frame while motion is running and time advances', () => {
  const { scheduler, scope } = setup();
  const frames = [];
  scope.loop((f) => frames.push(f));
  assert.equal(scheduler.pendingFrames, 1);
  scheduler.flushFrame(1000);
  scheduler.flushFrame(1016);
  scheduler.flushFrame(1032);
  assert.equal(frames.length, 3);
  assert.equal(frames[0].dt, 0, 'first frame has no delta');
  assert.ok(Math.abs(frames[1].dt - 0.016) < 1e-9);
  assert.ok(frames[2].time > frames[1].time);
  assert.ok(frames.every((f) => f.running));
  assert.equal(scheduler.pendingFrames, 1, 'keeps scheduling while running');
});

test('large gaps are clamped so animations never jump', () => {
  const { scheduler, scope } = setup();
  const frames = [];
  scope.loop((f) => frames.push(f));
  scheduler.flushFrame(0);
  scheduler.flushFrame(1);
  scheduler.flushFrame(5000);
  assert.ok(frames[2].dt <= 0.066);
});

test('pausing draws one still frame and then stops the rAF loop entirely', () => {
  const { scheduler, motion, scope } = setup();
  const frames = [];
  scope.loop((f) => frames.push(f));
  scheduler.flushFrame(1000);
  scheduler.flushFrame(1016);
  motion.setPaused(true);
  scheduler.flushFrame(1032);
  const last = frames.at(-1);
  assert.equal(last.running, false);
  assert.equal(last.dt, 0, 'still frame');
  assert.equal(scheduler.pendingFrames, 0, 'no further frames while paused');
  const frozen = last.time;

  scope.redraw();
  assert.equal(scheduler.pendingFrames, 1, 'redraw schedules exactly one frame');
  scheduler.flushFrame(2000);
  assert.equal(scheduler.pendingFrames, 0);
  assert.equal(frames.at(-1).time, frozen, 'time does not advance while paused');

  motion.setPaused(false);
  assert.equal(scheduler.pendingFrames, 1, 'resuming restarts the loop');
});

test('reduced motion starts with a single stationary frame', () => {
  const { scheduler, scope } = setup({ reduced: true });
  const frames = [];
  scope.loop((f) => frames.push(f));
  scheduler.flushFrame(10);
  assert.equal(frames.length, 1);
  assert.equal(frames[0].running, false);
  assert.equal(scheduler.pendingFrames, 0);
});

test('every() skips callbacks while paused; after() and on() are tracked', () => {
  const { scheduler, motion, scope } = setup();
  let ticks = 0;
  scope.every(100, () => ticks++);
  scheduler.tickIntervals();
  motion.setPaused(true);
  scheduler.tickIntervals();
  assert.equal(ticks, 1);
  let always = 0;
  scope.every(100, () => always++, { whilePaused: true });
  scheduler.tickIntervals();
  assert.equal(always, 1);

  let fired = 0;
  const cancel = scope.after(50, () => fired++);
  scope.after(50, () => fired++);
  cancel();
  scheduler.fireTimeouts();
  assert.equal(fired, 1);
  assert.equal(scope.stats().timeouts, 0, 'fired timeouts are forgotten');
});

test('destroy() cancels frames, timers, intervals, listeners and observers', () => {
  const { scheduler, motion, root, scope } = setup();
  const target = fakeEventTarget();
  let calls = 0;
  scope.loop(() => calls++);
  scope.every(100, () => calls++);
  scope.after(100, () => calls++);
  scope.on(target, 'pointermove', () => calls++);
  scope.actions({ go: () => calls++ });
  let cleaned = false;
  scope.onCleanup(() => {
    cleaned = true;
  });
  assert.equal(target.count(), 1);
  assert.equal(root.count(), 1);

  scope.destroy();
  assert.equal(scheduler.pendingFrames, 0);
  assert.equal(scheduler.pendingIntervals, 0);
  assert.equal(scheduler.pendingTimeouts, 0);
  assert.equal(target.count(), 0);
  assert.equal(root.count(), 0);
  assert.equal(cleaned, true);
  assert.deepEqual(scope.stats(), { loops: 0, timeouts: 0, intervals: 0, cleanups: 0, scheduled: false });

  motion.setPaused(true);
  motion.setPaused(false);
  scope.redraw();
  assert.equal(scheduler.pendingFrames, 0, 'a destroyed scope never schedules again');
  assert.equal(calls, 0);
  scope.destroy();
});

test('repeated mount/destroy cycles do not accumulate handlers', () => {
  const scheduler = fakeScheduler();
  const motion = createMotionController();
  const shared = fakeEventTarget();
  for (let i = 0; i < 25; i++) {
    const scope = createScope({ root: shared, motion, scheduler });
    shared.contains = () => true;
    scope.on(shared, 'keydown', () => {});
    scope.actions({ a() {} });
    scope.loop(() => {});
    scope.every(10, () => {});
    scope.destroy();
  }
  assert.equal(shared.count(), 0);
  assert.equal(scheduler.pendingFrames, 0);
  assert.equal(scheduler.pendingIntervals, 0);
});

test('actions() delegates clicks to the matching handler and skips disabled buttons', () => {
  const { root, scope, scheduler, motion } = setup();
  motion.setPaused(true);
  const calls = [];
  scope.actions({
    pulse: (button) => calls.push(button.name),
  });
  const button = (name, disabled = false) => ({
    name,
    disabled,
    getAttribute: (attr) => (attr === 'data-world-action' ? name : null),
  });
  const click = (btn) => root.dispatch('click', { target: { closest: () => btn } });
  click(button('pulse'));
  click(button('pulse', true));
  click(button('unknown'));
  root.dispatch('click', { target: { closest: () => null } });
  assert.deepEqual(calls, ['pulse']);
  assert.equal(scheduler.pendingFrames, 0, 'no loop registered, so nothing to draw');
  scope.loop(() => {});
  scheduler.flushFrame(1);
  click(button('pulse'));
  assert.equal(scheduler.pendingFrames, 1, 'an action while paused requests one still frame');
});

test('loop errors are isolated: a throwing loop is removed, others keep running', () => {
  const { scheduler, scope } = setup();
  const original = console.error;
  console.error = () => {};
  try {
    let good = 0;
    scope.loop(() => {
      throw new Error('boom');
    });
    scope.loop(() => good++);
    scheduler.flushFrame(1);
    scheduler.flushFrame(2);
    assert.equal(good, 2);
    assert.equal(scope.stats().loops, 1);
  } finally {
    console.error = original;
  }
});

test('createScope refuses to run without a motion controller', () => {
  assert.throws(() => createScope({}), TypeError);
});
