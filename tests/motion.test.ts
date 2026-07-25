import { describe, expect, test } from 'bun:test';
import { initializeFloatingRail, type FloatingRailDependencies } from '../src/lib/motion/floating-rail';

describe('floating enquiry rail', () => {
  test('starts mobile rails visible, collapsed, inert, and labelled to open', () => {
    const toggle = {
      addEventListener() {},
      removeEventListener() {},
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(this: { attributes: Record<string, string> }, name: string, value: string) { this.attributes[name] = value; },
      attributes: {} as Record<string, string>,
    } as unknown as HTMLButtonElement & { attributes: Record<string, string> };
    const panel = { inert: false } as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const documentTarget = { addEventListener() {}, removeEventListener() {} };
    let mediaQuery = '';
    initializeFloatingRail(root, {
      document: documentTarget as FloatingRailDependencies['document'],
      matchMedia(query) { mediaQuery = query; return { matches: true }; },
    });

    expect(mediaQuery).toBe('(max-width: 48rem)');
    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'false' });
    expect(panel.inert).toBe(true);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'false', 'aria-label': 'Open enquiries' });
  });

  test('starts desktop rails expanded and preserves complete click and Escape semantics', () => {
    const listeners = new Map<string, EventListener>();
    const removals: string[] = [];
    const createTarget = () => ({
      addEventListener(type: string, listener: EventListener) { listeners.set(type, listener); },
      removeEventListener(type: string) { removals.push(type); listeners.delete(type); },
    });
    const toggle = {
      ...createTarget(),
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(this: { attributes: Record<string, string> }, name: string, value: string) { this.attributes[name] = value; },
      attributes: { 'aria-expanded': 'false', 'aria-label': 'Open enquiries' } as Record<string, string>,
      focusCalls: 0,
      focus(this: { focusCalls: number }) { this.focusCalls += 1; },
    } as unknown as HTMLButtonElement & { attributes: Record<string, string>; focusCalls: number };
    const panel = {} as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const documentTarget = createTarget();
    const dependencies: FloatingRailDependencies = {
      document: documentTarget as FloatingRailDependencies['document'],
      matchMedia: () => ({ matches: false }),
    };

    const controller = initializeFloatingRail(root, dependencies);
    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'true' });
    expect(panel.inert).toBe(false);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
    expect([...listeners.keys()].sort()).toEqual(['click', 'keydown']);

    listeners.get('click')?.(new Event('click'));
    expect(root.dataset.expanded).toBe('false');
    expect(panel.inert).toBe(true);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'false', 'aria-label': 'Open enquiries' });

    listeners.get('click')?.(new Event('click'));
    expect(root.dataset.expanded).toBe('true');
    expect(panel.inert).toBe(false);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
    listeners.get('keydown')?.({ key: 'Escape' } as KeyboardEvent);
    expect(root.dataset.expanded).toBe('false');
    expect(panel.inert).toBe(true);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'false', 'aria-label': 'Open enquiries' });
    expect(toggle.focusCalls).toBe(1);

    controller.dispose();
    controller.dispose();
    expect(removals.sort()).toEqual(['click', 'keydown']);
  });

  test('starts visible and expanded without browser globals', () => {
    const toggle = {
      addEventListener() {},
      removeEventListener() {},
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(this: { attributes: Record<string, string> }, name: string, value: string) { this.attributes[name] = value; },
      attributes: {} as Record<string, string>,
    } as unknown as HTMLButtonElement & { attributes: Record<string, string> };
    const panel = { inert: true } as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const documentTarget = { addEventListener() {}, removeEventListener() {} };

    initializeFloatingRail(root, { document: documentTarget as FloatingRailDependencies['document'] });

    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'true' });
    expect(panel.inert).toBe(false);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
  });

  test('falls back to expanded when window exists without matchMedia', () => {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    const toggle = {
      addEventListener() {},
      removeEventListener() {},
      dataset: { openLabel: 'Open enquiries', closeLabel: 'Close enquiries' },
      setAttribute(this: { attributes: Record<string, string> }, name: string, value: string) { this.attributes[name] = value; },
      attributes: {} as Record<string, string>,
    } as unknown as HTMLButtonElement & { attributes: Record<string, string> };
    const panel = { inert: true } as HTMLElement;
    const root = {
      dataset: {} as Record<string, string>,
      querySelector: (selector: string) => selector === '[data-floating-rail-toggle]' ? toggle : selector === '#floating-rail-panel' ? panel : null,
    } as unknown as HTMLElement;
    const documentTarget = { addEventListener() {}, removeEventListener() {} };

    try {
      initializeFloatingRail(root, { document: documentTarget as FloatingRailDependencies['document'] });
    } finally {
      if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
      else Reflect.deleteProperty(globalThis, 'window');
    }

    expect(root.dataset).toMatchObject({ ready: 'true', visible: 'true', expanded: 'true' });
    expect(panel.inert).toBe(false);
    expect(toggle.attributes).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Close enquiries' });
  });
});
