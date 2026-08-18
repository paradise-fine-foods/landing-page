import { afterAll, describe, expect, test } from 'bun:test';
import { createCarousel, hasOverflow, nextIndex, previousIndex } from '../src/lib/carousel/controller';

type Listener = (event: Event) => void;

class FakeElement {
  dataset: Record<string, string> = {};
  disabled = false;
  hidden = true;
  offsetLeft = 0;
  scrollLeft = 0;
  scrollWidth = 0;
  clientWidth = 0;
  tabIndex = 0;
  textContent = '';
  readonly calls: ScrollIntoViewOptions[] = [];
  readonly listeners = new Map<string, Set<Listener>>();
  readonly log: string[];
  private readonly one = new Map<string, FakeElement>();
  private readonly many = new Map<string, FakeElement[]>();

  constructor(log: string[] = []) { this.log = log; }
  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.log.push(`listen:${type}`);
    const callback = listener as Listener;
    const listeners = this.listeners.get(type) ?? new Set<Listener>();
    listeners.add(callback);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.log.push(`remove:${type}`);
    this.listeners.get(type)?.delete(listener as Listener);
  }
  querySelector(selector: string) { return this.one.get(selector) ?? null; }
  querySelectorAll(selector: string) { return this.many.get(selector) ?? []; }
  register(selector: string, element: FakeElement) { this.one.set(selector, element); }
  registerAll(selector: string, elements: FakeElement[]) { this.many.set(selector, elements); }
  scrollIntoView(options: ScrollIntoViewOptions) { this.calls.push(options); }
  setHidden(value: boolean) { this.hidden = value; this.log.push(`hidden:${value}`); }
  emit(type: string, event = new Event(type, { cancelable: true })) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
}

let resizeObservers: FakeResizeObserver[] = [];

class FakeResizeObserver {
  readonly observed: FakeElement[] = [];
  constructor(private readonly callback: () => void) { resizeObservers.push(this); }
  observe(target: FakeElement) { this.observed.push(target); }
  unobserve() {}
  disconnect() { this.observed.length = 0; }
  trigger() { this.callback(); }
}

const originalResizeObserver = globalThis.ResizeObserver;
afterAll(() => { globalThis.ResizeObserver = originalResizeObserver; });

const harness = (count = 3) => {
  resizeObservers = [];
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  const log: string[] = [];
  const root = new FakeElement(log);
  const viewport = new FakeElement(log);
  viewport.scrollWidth = count * 300;
  viewport.clientWidth = 600;
  const controls = new FakeElement(log);
  let controlsHidden = true;
  Object.defineProperty(controls, 'hidden', {
    get() { return controlsHidden; },
    set(value: boolean) { controlsHidden = value; log.push(`hidden:${value}`); },
    configurable: true,
  });
  const previous = new FakeElement(log);
  const next = new FakeElement(log);
  const status = new FakeElement(log);
  const items = Array.from({ length: count }, (_, index) => {
    const item = new FakeElement(log);
    item.offsetLeft = index * 300;
    return item;
  });
  root.register('[data-carousel-viewport]', viewport);
  root.register('[data-carousel-controls]', controls);
  root.register('[data-carousel-previous]', previous);
  root.register('[data-carousel-next]', next);
  root.register('[data-carousel-status]', status);
  root.registerAll('[data-carousel-item]', items);
  return { root, viewport, controls, previous, next, status, items, log, resizeObservers };
};

describe('manual carousel state', () => {
  test('clamps instead of wrapping or creating clones', () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(2, 3)).toBe(2);
    expect(nextIndex(0, 0)).toBe(0);
    expect(previousIndex(0)).toBe(0);
    expect(previousIndex(2)).toBe(1);
  });
});

describe('overflow detection', () => {
  test('hasOverflow tolerates a one-pixel difference', () => {
    expect(hasOverflow({ scrollWidth: 900, clientWidth: 600 })).toBe(true);
    expect(hasOverflow({ scrollWidth: 602, clientWidth: 600 })).toBe(true);
    expect(hasOverflow({ scrollWidth: 601, clientWidth: 600 })).toBe(false);
    expect(hasOverflow({ scrollWidth: 600, clientWidth: 600 })).toBe(false);
  });
});

describe('manual carousel controller', () => {
  test('installs listeners before revealing initialized controls', () => {
    const setup = harness();
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    const revealIndex = setup.log.indexOf('hidden:false');
    expect(revealIndex).toBeGreaterThan(-1);
    expect(setup.log.slice(0, revealIndex).filter((entry) => entry.startsWith('listen:')).length).toBe(4);
  });

  test('sets initial status and clamps button navigation', () => {
    const setup = harness();
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    expect(setup.status.textContent).toBe('1 / 3');
    expect(setup.previous.disabled).toBe(true);
    expect(setup.next.disabled).toBe(false);
    setup.next.emit('click');
    setup.next.emit('click');
    setup.next.emit('click');
    expect(setup.status.textContent).toBe('3 / 3');
    expect(setup.next.disabled).toBe(true);
    expect(setup.items[2].calls.at(-1)).toEqual({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setup.previous.emit('click');
    expect(setup.status.textContent).toBe('2 / 3');
  });

  test('handles arrow keys, prevents default, and respects reduced motion', () => {
    const setup = harness();
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: true });
    const right = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowRight' });
    setup.viewport.emit('keydown', right);
    expect(right.defaultPrevented).toBe(true);
    expect(setup.items[1].calls.at(-1)).toEqual({ behavior: 'auto', block: 'nearest', inline: 'start' });
    const left = Object.assign(new Event('keydown', { cancelable: true }), { key: 'ArrowLeft' });
    setup.viewport.emit('keydown', left);
    expect(left.defaultPrevented).toBe(true);
    expect(setup.status.textContent).toBe('1 / 3');
  });

  test('updates controls after native scrolling and disposes every listener once', () => {
    const setup = harness();
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    setup.viewport.scrollLeft = 580;
    setup.viewport.emit('scroll');
    expect(setup.status.textContent).toBe('3 / 3');
    controller.dispose();
    controller.dispose();
    expect(setup.log.filter((entry) => entry.startsWith('remove:'))).toHaveLength(4);
    expect([...setup.viewport.listeners.values(), ...setup.previous.listeners.values(), ...setup.next.listeners.values()].flatMap((set) => [...set])).toHaveLength(0);
  });

  test('normalizes native scroll positions when items have a nonzero offset parent origin', () => {
    const setup = harness();
    for (const item of setup.items) item.offsetLeft += 120;
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    setup.viewport.scrollLeft = 250;
    setup.viewport.emit('scroll');
    expect(setup.status.textContent).toBe('2 / 3');
  });

  test('uses the localized rendered status template', () => {
    const setup = harness();
    setup.status.dataset = {
      carouselStatusTemplate: 'Product {current} of {total}',
    };
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    expect(setup.status.textContent).toBe('Product 1 of 3');
    setup.next.emit('click');
    expect(setup.status.textContent).toBe('Product 2 of 3');
  });

  test('missing required DOM returns a safe no-op without revealing controls', () => {
    const setup = harness(0);
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    controller.dispose();
    controller.dispose();
    expect(setup.log).not.toContain('hidden:false');
  });

  test('stays hidden and inert when everything fits', () => {
    const setup = harness();
    setup.viewport.scrollWidth = 600;
    setup.viewport.clientWidth = 600;
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    expect(setup.log).not.toContain('hidden:false');
    expect(setup.log).not.toContain('listen:');
    expect(setup.viewport.tabIndex).toBe(-1);
    expect(setup.status.textContent).toBe('');
    expect(setup.previous.disabled).toBe(false);
    expect(setup.next.disabled).toBe(false);
    controller.dispose();
  });

  test('reveals controls when the viewport starts overflowing', () => {
    const setup = harness();
    setup.viewport.scrollWidth = 600;
    setup.viewport.clientWidth = 600;
    createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    setup.viewport.scrollWidth = 1200;
    setup.resizeObservers[0].trigger();
    expect(setup.log).toContain('hidden:false');
    expect(setup.log.filter((entry) => entry.startsWith('listen:')).length).toBe(4);
    expect(setup.viewport.tabIndex).toBe(0);
    expect(setup.status.textContent).toBe('1 / 3');
    expect(setup.previous.disabled).toBe(true);
    expect(setup.next.disabled).toBe(false);
  });

  test('hides and disables the carousel when overflow goes away', () => {
    const setup = harness();
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    expect(setup.log).toContain('hidden:false');
    setup.viewport.scrollWidth = 600;
    setup.resizeObservers[0].trigger();
    expect(setup.log).toContain('hidden:true');
    expect(setup.log.filter((entry) => entry.startsWith('remove:')).length).toBe(4);
    expect(setup.viewport.tabIndex).toBe(-1);
    setup.next.emit('click');
    expect(setup.status.textContent).toBe('1 / 3');
    expect(setup.items[1].calls.length).toBe(0);
    controller.dispose();
  });

  test('reactivates cleanly when overflow returns', () => {
    const setup = harness();
    setup.viewport.scrollWidth = 600;
    setup.viewport.clientWidth = 600;
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    setup.viewport.scrollWidth = 1200;
    setup.resizeObservers[0].trigger();
    setup.viewport.scrollWidth = 600;
    setup.resizeObservers[0].trigger();
    setup.viewport.scrollWidth = 1200;
    setup.resizeObservers[0].trigger();
    expect(setup.viewport.tabIndex).toBe(0);
    expect(setup.status.textContent).toBe('1 / 3');
    expect(setup.previous.disabled).toBe(true);
    setup.next.emit('click');
    expect(setup.status.textContent).toBe('2 / 3');
    expect(setup.items[1].calls.at(-1)).toEqual({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    controller.dispose();
  });

  test('dispose disconnects the resize observer', () => {
    const setup = harness();
    const controller = createCarousel(setup.root as unknown as HTMLElement, { reduceMotion: false });
    expect(setup.resizeObservers[0].observed.length).toBe(4);
    controller.dispose();
    expect(setup.resizeObservers[0].observed.length).toBe(0);
  });
});
