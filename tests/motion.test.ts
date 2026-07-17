import { describe, expect, test } from 'bun:test';
import {
  createLivingCanvasController,
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

const makeHarness = (hasContext = true) => {
  let frameCallback: FrameRequestCallback | undefined;
  let cancelCount = 0;
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
    getBoundingClientRect: () => ({ width: 320, height: 180 }),
  } as unknown as HTMLCanvasElement;
  const dependencies: LivingCanvasDependencies = {
    devicePixelRatio: 3,
    requestFrame(callback) { frameCallback = callback; return 41; },
    cancelFrame() { cancelCount += 1; },
    createResizeObserver: (callback) => ({
      observe() { callback(); },
      disconnect() { disconnectCount += 1; },
    }),
  };
  return {
    canvas,
    dependencies,
    drawFrame: () => frameCallback?.(16),
    counts: () => ({ cancelCount, disconnectCount, ellipseCount, clearCount }),
  };
};

describe('living canvas lifecycle', () => {
  test('missing 2D context returns a safe idempotent disposer', () => {
    const harness = makeHarness(false);
    const controller = createLivingCanvasController(harness.canvas, harness.dependencies);
    controller.dispose();
    controller.dispose();
    expect(harness.counts()).toEqual({ cancelCount: 0, disconnectCount: 0, ellipseCount: 0, clearCount: 0 });
  });

  test('caps DPR and allocates no more than twelve slow shapes', () => {
    const harness = makeHarness();
    createLivingCanvasController(harness.canvas, harness.dependencies);
    harness.drawFrame();
    expect(harness.canvas.width).toBe(640);
    expect(harness.canvas.height).toBe(360);
    expect(harness.counts().ellipseCount).toBeGreaterThan(0);
    expect(harness.counts().ellipseCount).toBeLessThanOrEqual(12);
  });

  test('dispose cancels RAF, disconnects resize observation, clears, and is idempotent', () => {
    const harness = makeHarness();
    const controller = createLivingCanvasController(harness.canvas, harness.dependencies);
    controller.dispose();
    controller.dispose();
    expect(harness.counts().cancelCount).toBe(1);
    expect(harness.counts().disconnectCount).toBe(1);
    expect(harness.counts().clearCount).toBeGreaterThan(0);
  });
});
