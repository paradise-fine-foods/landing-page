import { describe, expect, test } from 'bun:test';
import {
  createLivingCanvasController,
  createLivingParticles,
  type LivingCanvasDependencies,
} from '../src/lib/motion/living-canvas';
import { shouldEnhanceMotion } from '../src/lib/motion/preferences';

describe('motion eligibility', () => {
  test('allows enhancement only without reduced motion or save-data', () => {
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: false })).toBe(true);
    expect(shouldEnhanceMotion({ reduceMotion: true, saveData: false })).toBe(false);
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: true })).toBe(false);
    expect(shouldEnhanceMotion({ reduceMotion: true, saveData: true })).toBe(false);
  });
});

type SetupFailure = 'observe' | 'resize' | 'request';

const makeHarness = (hasContext = true, setupFailure?: SetupFailure) => {
  const frames = new Map<number, FrameRequestCallback>();
  const cancelledFrames: number[] = [];
  let nextFrame = 41;
  let disconnectCount = 0;
  let ellipseCount = 0;
  let clearCount = 0;
  const context = {
    beginPath() {},
    clearRect() { clearCount += 1; },
    ellipse() { ellipseCount += 1; },
    fill() {},
    setTransform() {},
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => hasContext ? context : null,
    getBoundingClientRect: () => {
      if (setupFailure === 'resize') throw new Error('resize failed');
      return { width: 320, height: 180 };
    },
  } as unknown as HTMLCanvasElement;
  const dependencies: LivingCanvasDependencies = {
    devicePixelRatio: 3,
    requestFrame(callback) {
      if (setupFailure === 'request') throw new Error('request failed');
      const handle = nextFrame++;
      frames.set(handle, callback);
      return handle;
    },
    cancelFrame(handle) { cancelledFrames.push(handle); frames.delete(handle); },
    createResizeObserver: () => ({
      observe() {
        if (setupFailure === 'observe') throw new Error('observe failed');
      },
      disconnect() { disconnectCount += 1; },
    }),
  };
  return {
    canvas,
    dependencies,
    drawLatestFrame: (time = 16) => {
      const latest = [...frames].at(-1);
      if (!latest) return;
      frames.delete(latest[0]);
      latest[1](time);
    },
    counts: () => ({ cancelledFrames, disconnectCount, ellipseCount, clearCount, scheduledFrames: [...frames.keys()] }),
  };
};

describe('living canvas lifecycle', () => {
  test('missing 2D context returns a safe idempotent disposer', () => {
    const harness = makeHarness(false);
    const controller = createLivingCanvasController(harness.canvas, harness.dependencies);
    controller.dispose();
    controller.dispose();
    expect(harness.counts()).toEqual({ cancelledFrames: [], disconnectCount: 0, ellipseCount: 0, clearCount: 0, scheduledFrames: [] });
  });

  test('allocates exactly ten deterministic particles', () => {
    const particles = createLivingParticles();
    expect(particles).toHaveLength(10);
    expect(particles.length).toBeLessThanOrEqual(10);
    expect(particles).toEqual(createLivingParticles());
  });

  test('caps DPR and draws every allocated particle', () => {
    const harness = makeHarness();
    createLivingCanvasController(harness.canvas, harness.dependencies);
    harness.drawLatestFrame();
    expect(harness.canvas.width).toBe(640);
    expect(harness.canvas.height).toBe(360);
    expect(harness.counts().ellipseCount).toBe(createLivingParticles().length);
  });

  test('dispose cancels only the latest scheduled RAF, disconnects, clears, and is idempotent', () => {
    const harness = makeHarness();
    const controller = createLivingCanvasController(harness.canvas, harness.dependencies);
    expect(harness.counts().scheduledFrames).toEqual([41]);
    harness.drawLatestFrame();
    expect(harness.counts().scheduledFrames).toEqual([42]);
    controller.dispose();
    controller.dispose();
    expect(harness.counts().cancelledFrames).toEqual([42]);
    expect(harness.counts().disconnectCount).toBe(1);
    expect(harness.counts().clearCount).toBeGreaterThan(0);
  });

  for (const failure of ['observe', 'resize', 'request'] as const) {
    test(`rolls back resources when ${failure} fails during setup`, () => {
      const harness = makeHarness(true, failure);
      const controller = createLivingCanvasController(harness.canvas, harness.dependencies);
      controller.dispose();
      controller.dispose();
      expect(harness.counts().scheduledFrames).toEqual([]);
      expect(harness.counts().cancelledFrames).toEqual([]);
      expect(harness.counts().disconnectCount).toBe(1);
      expect(harness.counts().clearCount).toBeGreaterThan(0);
      expect(harness.canvas.width).toBe(1);
      expect(harness.canvas.height).toBe(1);
    });
  }
});
