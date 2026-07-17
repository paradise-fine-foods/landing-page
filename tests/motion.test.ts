import { describe, expect, test } from 'bun:test';
import {
  createLivingCanvasController,
  createLivingParticles,
  type LivingCanvasDependencies,
} from '../src/lib/motion/living-canvas';
import { shouldDisposePage, shouldEnhanceMotion } from '../src/lib/motion/preferences';
import { installReveals, type RevealDependencies } from '../src/lib/motion/reveal';
import { initializeFloatingRail, shouldShowFloatingRail, type FloatingRailDependencies } from '../src/lib/motion/floating-rail';

describe('one-shot scroll reveals', () => {
  test('observes authored reveal nodes at the exact threshold and settles each once', () => {
    const first = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    const second = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    const observed: Element[] = [];
    const unobserved: Element[] = [];
    let callback: IntersectionObserverCallback = () => {};
    let threshold: number | number[] | undefined;
    let disconnects = 0;
    const dependencies: RevealDependencies = {
      createObserver(nextCallback, options) {
        callback = nextCallback;
        threshold = options?.threshold;
        return {
          observe(node: Element) { observed.push(node); },
          unobserve(node: Element) { unobserved.push(node); },
          disconnect: () => { disconnects += 1; },
        } as unknown as IntersectionObserver;
      },
    };
    const root = { querySelectorAll: (selector: string) => selector === '[data-reveal]' ? [first, second] : [] } as unknown as ParentNode;
    const controller = installReveals(root, dependencies);
    expect(observed).toEqual([first, second]);
    expect(threshold).toBe(0.18);
    callback([
      { target: first, isIntersecting: true },
      { target: second, isIntersecting: false },
    ] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver);
    callback([{ target: first, isIntersecting: true }] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver);
    expect((first as unknown as { dataset: Record<string, string> }).dataset.revealed).toBe('true');
    expect((second as unknown as { dataset: Record<string, string> }).dataset.revealed).toBeUndefined();
    expect(unobserved).toEqual([first]);
    controller.dispose();
    controller.dispose();
    expect(disconnects).toBe(1);
  });

  test('missing IntersectionObserver settles content and returns a safe no-op', () => {
    const node = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    const root = { querySelectorAll: () => [node] } as unknown as ParentNode;
    const controller = installReveals(root, { createObserver: undefined });
    expect((node as unknown as { dataset: Record<string, string> }).dataset.revealed).toBe('true');
    controller.dispose();
    controller.dispose();
  });

  test('disconnects and settles every node when observation fails partway through setup', () => {
    const first = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    const second = { dataset: {} as Record<string, string> } as unknown as HTMLElement;
    let observations = 0;
    let disconnects = 0;
    const root = { querySelectorAll: () => [first, second] } as unknown as ParentNode;
    const controller = installReveals(root, {
      createObserver: () => ({
        observe() {
          observations += 1;
          if (observations === 2) throw new Error('observe failed');
        },
        unobserve() {},
        disconnect() { disconnects += 1; },
      }) as unknown as IntersectionObserver,
    });
    expect(disconnects).toBe(1);
    expect((first as unknown as { dataset: Record<string, string> }).dataset.revealed).toBe('true');
    expect((second as unknown as { dataset: Record<string, string> }).dataset.revealed).toBe('true');
    controller.dispose();
    expect(disconnects).toBe(1);
  });
});

describe('motion eligibility', () => {
  test('allows enhancement only without reduced motion or save-data', () => {
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: false })).toBe(true);
    expect(shouldEnhanceMotion({ reduceMotion: true, saveData: false })).toBe(false);
    expect(shouldEnhanceMotion({ reduceMotion: false, saveData: true })).toBe(false);
    expect(shouldEnhanceMotion({ reduceMotion: true, saveData: true })).toBe(false);
  });

  test('keeps controllers alive for BFCache pagehide and disposes on terminal pagehide', () => {
    expect(shouldDisposePage({ persisted: true })).toBe(false);
    expect(shouldDisposePage({ persisted: false })).toBe(true);
  });
});

describe('floating enquiry rail', () => {
  test('shows only after scrolling beyond one viewport height', () => {
    expect(shouldShowFloatingRail(0, 800)).toBe(false);
    expect(shouldShowFloatingRail(801, 800)).toBe(true);
  });

  test('synchronizes rail state and cleans up each listener once', () => {
    const listeners = new Map<string, EventListener>();
    const removals: string[] = [];
    const createTarget = () => ({
      addEventListener(type: string, listener: EventListener) { listeners.set(type, listener); },
      removeEventListener(type: string) { removals.push(type); listeners.delete(type); },
    });
    const toggle = {
      ...createTarget(),
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(name: string, value: string) { this.attributes[name] = value; },
      attributes: { 'aria-expanded': 'false', 'aria-label': 'Open enquiries' } as Record<string, string>,
      focusCalls: 0,
      focus() { this.focusCalls += 1; },
    } as unknown as HTMLButtonElement & { attributes: Record<string, string>; focusCalls: number };
    const panel = {} as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const viewport = { ...createTarget(), scrollY: 900, innerHeight: 800, innerWidth: 1024 };
    const documentTarget = createTarget();
    const dependencies: FloatingRailDependencies = {
      viewport: viewport as FloatingRailDependencies['viewport'],
      document: documentTarget as FloatingRailDependencies['document'],
    };

    const controller = initializeFloatingRail(root, dependencies);
    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'true' });
    viewport.scrollY = 0;
    listeners.get('scroll')?.(new Event('scroll'));
    expect(root.dataset).toMatchObject({ visible: 'false', expanded: 'false' });
    listeners.get('click')?.(new Event('click'));
    expect(root.dataset.expanded).toBe('true');
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
    listeners.get('keydown')?.({ key: 'Escape' } as KeyboardEvent);
    expect(root.dataset.expanded).toBe('false');
    expect(toggle.focusCalls).toBe(1);
    controller.dispose();
    controller.dispose();
    expect(removals.sort()).toEqual(['click', 'keydown', 'scroll']);
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
