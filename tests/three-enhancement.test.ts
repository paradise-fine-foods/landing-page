import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Texture } from 'three';
import { installStageActivation } from '../src/lib/three/activation';
import { shouldEnhance3D } from '../src/lib/three/enhancement';
import {
  MAX_ROTATION_DEGREES,
  MODEL_LOAD_DEADLINE_MS,
  mountProductViewer,
  type ViewerDependencies,
} from '../src/lib/three/viewer';

const stageSource = readFileSync(resolve(import.meta.dir, '../src/components/three/ProductStage.astro'), 'utf8');

test.each([
  [{ saveData: false, reducedMotion: false, webglAvailable: true }, true],
  [{ saveData: true, reducedMotion: false, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: true, webglAvailable: true }, false],
  [{ saveData: false, reducedMotion: false, webglAvailable: false }, false],
])('3D eligibility %o => %s', (input, expected) => {
  expect(shouldEnhance3D(input)).toBe(expected);
});

describe('stage activation', () => {
  test('waits for actual intersection and removes every trigger after activation', () => {
    const target = new EventTarget();
    let intersection: ((value: boolean) => void) | undefined;
    let disconnects = 0;
    let activations = 0;
    const controller = installStageActivation({
      target,
      activate: () => activations += 1,
      createObserver: (callback) => {
        intersection = callback;
        return { observe: () => {}, disconnect: () => disconnects += 1 };
      },
    });

    intersection?.(false);
    expect(activations).toBe(0);
    intersection?.(true);
    expect(activations).toBe(1);
    expect(disconnects).toBe(1);
    target.dispatchEvent(new Event('focusin'));
    target.dispatchEvent(new Event('pointerenter'));
    target.dispatchEvent(new Event('pointerdown'));
    expect(activations).toBe(1);
    controller.dispose();
    expect(disconnects).toBe(1);
  });

  test.each(['focusin', 'pointerenter', 'pointerdown'])('activates once on %s intent', (eventName) => {
    const target = new EventTarget();
    let activations = 0;
    let disconnects = 0;
    installStageActivation({
      target,
      activate: () => activations += 1,
      createObserver: () => ({ observe: () => {}, disconnect: () => disconnects += 1 }),
    });
    target.dispatchEvent(new Event(eventName));
    target.dispatchEvent(new Event(eventName));
    expect(activations).toBe(1);
    expect(disconnects).toBe(1);
  });
});

class FakeCanvas extends EventTarget {
  style = { touchAction: '' };
  clientWidth = 100;
  captures = new Set<number>();
  releaseCount = 0;
  listenerAdds = new Map<string, number>();
  listenerRemoves = new Map<string, number>();

  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean) {
    this.listenerAdds.set(type, (this.listenerAdds.get(type) ?? 0) + 1);
    super.addEventListener(type, callback, options);
  }
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) {
    this.listenerRemoves.set(type, (this.listenerRemoves.get(type) ?? 0) + 1);
    super.removeEventListener(type, callback, options);
  }

  getBoundingClientRect() {
    return { width: 100, height: 80, x: 0, y: 0, top: 0, right: 100, bottom: 80, left: 0, toJSON: () => ({}) } as DOMRect;
  }
  setPointerCapture(pointerId: number) { this.captures.add(pointerId); }
  hasPointerCapture(pointerId: number) { return this.captures.has(pointerId); }
  releasePointerCapture(pointerId: number) {
    this.captures.delete(pointerId);
    this.releaseCount += 1;
  }
}

function pointerEvent(type: string, values: Partial<PointerEvent>) {
  const event = new Event(type, { cancelable: true });
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(event, key, { configurable: true, value });
  }
  return event as PointerEvent;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

function trackedModel() {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial();
  const texture = new Texture();
  material.map = texture;
  const counts = { geometry: 0, material: 0, texture: 0 };
  const geometryDispose = geometry.dispose.bind(geometry);
  const materialDispose = material.dispose.bind(material);
  const textureDispose = texture.dispose.bind(texture);
  geometry.dispose = () => { counts.geometry += 1; geometryDispose(); };
  material.dispose = () => { counts.material += 1; materialDispose(); };
  texture.dispose = () => { counts.texture += 1; textureDispose(); };
  const root = new Group();
  root.add(new Mesh(geometry, material));
  root.add(new Mesh(geometry, material));
  return { root, counts };
}

function viewerHarness() {
  const canvas = new FakeCanvas();
  const request = deferred<{ ok: boolean; arrayBuffer: () => Promise<ArrayBuffer> }>();
  const rendererCounts = { render: 0, dispose: 0, forceContextLoss: 0 };
  const renderer = {
    setClearColor: () => {},
    setPixelRatio: () => {},
    setSize: () => {},
    render: () => rendererCounts.render += 1,
    dispose: () => rendererCounts.dispose += 1,
    forceContextLoss: () => rendererCounts.forceContextLoss += 1,
  };
  let parseLoad: ((gltf: { scene: Group }) => void) | undefined;
  let parseError: ((error: unknown) => void) | undefined;
  let parseCalls = 0;
  let fetchCalls = 0;
  let fetchSignal: AbortSignal | undefined;
  let deadlineCallback: (() => void) | undefined;
  let deadlineMilliseconds = 0;
  let deadlineClears = 0;
  let resizeDisconnects = 0;
  let nextFrame = 1;
  const frames = new Map<number, FrameRequestCallback>();
  const dependencies: Partial<ViewerDependencies> = {
    createRenderer: () => renderer,
    createLoader: () => ({
      parse: (_data, _path, onLoad, onError) => {
        parseCalls += 1;
        parseLoad = onLoad as typeof parseLoad;
        parseError = onError;
      },
    }),
    createResizeObserver: () => ({ observe: () => {}, disconnect: () => resizeDisconnects += 1 }),
    fetchModel: (_url, { signal }) => {
      fetchCalls += 1;
      fetchSignal = signal;
      return request.promise;
    },
    setDeadline: (callback, milliseconds) => {
      deadlineCallback = callback;
      deadlineMilliseconds = milliseconds;
      return 1 as unknown as ReturnType<typeof setTimeout>;
    },
    clearDeadline: () => deadlineClears += 1,
    requestFrame: (callback) => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelFrame: (handle) => { frames.delete(handle); },
    resolveModelBasePath: () => 'https://example.test/models/',
    devicePixelRatio: () => 2,
  };

  const errors = { count: 0 };
  const ready = { count: 0 };
  const controller = mountProductViewer({
    canvas: canvas as unknown as HTMLCanvasElement,
    modelSrc: '/models/demo.glb',
    onReady: () => ready.count += 1,
    onError: () => errors.count += 1,
  }, dependencies);

  return {
    canvas, request, controller, errors, ready, rendererCounts, frames,
    get parseLoad() { return parseLoad; },
    get parseError() { return parseError; },
    get parseCalls() { return parseCalls; },
    get fetchCalls() { return fetchCalls; },
    get fetchSignal() { return fetchSignal; },
    get deadlineCallback() { return deadlineCallback; },
    get deadlineMilliseconds() { return deadlineMilliseconds; },
    get deadlineClears() { return deadlineClears; },
    get resizeDisconnects() { return resizeDisconnects; },
  };
}

async function reachParse(harness: ReturnType<typeof viewerHarness>) {
  harness.request.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
  await settle();
  expect(harness.parseCalls).toBe(1);
}

describe('viewer lifecycle', () => {
  test('aborts at five seconds, cleans once, ignores late success, and never retries', async () => {
    const harness = viewerHarness();
    expect(harness.deadlineMilliseconds).toBe(MODEL_LOAD_DEADLINE_MS);
    expect(harness.deadlineMilliseconds).toBe(5_000);
    harness.deadlineCallback?.();
    expect(harness.fetchSignal?.aborted).toBe(true);
    expect(harness.errors.count).toBe(1);
    expect(harness.rendererCounts.dispose).toBe(1);
    expect(harness.rendererCounts.forceContextLoss).toBe(1);
    expect(harness.resizeDisconnects).toBe(1);

    harness.request.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await settle();
    expect(harness.parseCalls).toBe(0);
    expect(harness.ready.count).toBe(0);
    expect(harness.fetchCalls).toBe(1);
    harness.deadlineCallback?.();
    expect(harness.errors.count).toBe(1);
    expect(harness.rendererCounts.dispose).toBe(1);
  });

  test('disposes a parse result that arrives after the deadline', async () => {
    const harness = viewerHarness();
    await reachParse(harness);
    const model = trackedModel();
    harness.deadlineCallback?.();
    harness.parseLoad?.({ scene: model.root });
    expect(harness.ready.count).toBe(0);
    expect(model.counts).toEqual({ geometry: 1, material: 1, texture: 1 });
    expect(harness.fetchCalls).toBe(1);
  });

  test('clamps pointer rotation and releases capture while disposing every resource once', async () => {
    const harness = viewerHarness();
    await reachParse(harness);
    const model = trackedModel();
    harness.parseLoad?.({ scene: model.root });
    expect(harness.ready.count).toBe(1);
    expect(harness.deadlineClears).toBe(1);

    harness.canvas.dispatchEvent(pointerEvent('pointerdown', { pointerId: 7, clientX: 0, isPrimary: true, button: 0 }));
    harness.canvas.dispatchEvent(pointerEvent('pointermove', { pointerId: 7, clientX: 2_000, isPrimary: true }));
    expect(model.root.rotation.y).toBeCloseTo(MAX_ROTATION_DEGREES * Math.PI / 180);
    expect(harness.canvas.captures.has(7)).toBe(true);

    harness.controller.dispose();
    harness.controller.dispose();
    expect(harness.canvas.releaseCount).toBe(1);
    expect(model.counts).toEqual({ geometry: 1, material: 1, texture: 1 });
    expect(harness.rendererCounts.dispose).toBe(1);
    expect(harness.rendererCounts.forceContextLoss).toBe(1);
    expect(harness.resizeDisconnects).toBe(1);
    for (const eventName of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'webglcontextlost']) {
      expect(harness.canvas.listenerAdds.get(eventName)).toBe(1);
      expect(harness.canvas.listenerRemoves.get(eventName)).toBe(1);
    }

    harness.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(harness.errors.count).toBe(0);
    expect(harness.rendererCounts.dispose).toBe(1);
  });

  test('context loss reports fallback and cleans without forcing a second loss', async () => {
    const harness = viewerHarness();
    await reachParse(harness);
    const model = trackedModel();
    harness.parseLoad?.({ scene: model.root });
    const event = new Event('webglcontextlost', { cancelable: true });
    harness.canvas.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(harness.errors.count).toBe(1);
    expect(harness.rendererCounts.dispose).toBe(1);
    expect(harness.rendererCounts.forceContextLoss).toBe(0);
    expect(model.counts).toEqual({ geometry: 1, material: 1, texture: 1 });
  });

  test('disconnect during fetch aborts and removes listeners without a fallback announcement', async () => {
    const harness = viewerHarness();
    harness.controller.dispose();
    expect(harness.fetchSignal?.aborted).toBe(true);
    expect(harness.errors.count).toBe(0);
    expect(harness.rendererCounts.dispose).toBe(1);
    harness.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(harness.errors.count).toBe(0);

    harness.request.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await settle();
    expect(harness.parseCalls).toBe(0);
    expect(harness.fetchCalls).toBe(1);
  });

  test('parse failure funnels through the same idempotent cleanup', async () => {
    const harness = viewerHarness();
    await reachParse(harness);
    harness.parseError?.(new Error('invalid glb'));
    harness.parseError?.(new Error('late duplicate'));
    expect(harness.errors.count).toBe(1);
    expect(harness.rendererCounts.dispose).toBe(1);
    expect(harness.rendererCounts.forceContextLoss).toBe(1);
  });
});

test('component keeps runtime/model deferred and uses an actual viewport boundary', () => {
  expect(stageSource).toContain("rootMargin: '0px'");
  expect(stageSource).toContain("import('../../lib/three/viewer')");
  expect(stageSource).not.toContain("import('@google/model-viewer')");
  expect(stageSource).not.toMatch(/<model-viewer\b/);
  expect(stageSource).toContain('data-model-src={modelSrc}');
});
