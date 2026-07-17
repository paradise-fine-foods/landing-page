import { describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertCarousel,
  assertHomepageLogo,
  assertRedirect,
  collectReachableJs,
} from './verify-built-living-design';

const fixtureDir = () => mkdtempSync(join(tmpdir(), 'living-build-verifier-'));
const carousel = (body: string) => `<section aria-roledescription="carousel" aria-label="Featured products" data-carousel>${body}</section>`;
const completeCarousel = carousel(`
  <button data-carousel-previous aria-label="Previous product"></button>
  <p aria-live="polite" aria-atomic="true" data-carousel-status data-carousel-status-template="Product {current} of {total}"></p>
  <button data-carousel-next aria-label="Next product"></button>
  <div data-carousel-viewport tabindex="0"><div data-carousel-item></div><div data-carousel-item></div></div>
`);

describe('living build verifier semantics', () => {
  test('follows generic emitted JavaScript imports recursively and only once', () => {
    const dist = fixtureDir();
    mkdirSync(join(dist, '_astro'));
    writeFileSync(join(dist, '_astro', 'entry.js'), 'import("./generic.A.js"); import("./generic.A.js");');
    writeFileSync(join(dist, '_astro', 'generic.A.js'), 'import "./shared.B.js";');
    writeFileSync(join(dist, '_astro', 'shared.B.js'), 'export const ready = true;');
    expect([...collectReachableJs(dist, '/_astro/entry.js')].map((path) => path.split(/[\\/]/).at(-1)).sort())
      .toEqual(['entry.js', 'generic.A.js', 'shared.B.js']);
  });

  test('requires an actual root-relative emitted logo image', () => {
    const dist = fixtureDir();
    mkdirSync(join(dist, '_astro'));
    writeFileSync(join(dist, '_astro', 'paradise-fine-foods-logo.demo.webp'), 'logo');
    expect(() => assertHomepageLogo('<script src="/_astro/paradise-fine-foods-logo.demo.webp"></script>', dist, 'en')).toThrow();
    expect(() => assertHomepageLogo('<img src="https://evil.test/_astro/paradise-fine-foods-logo.demo.webp">', dist, 'en')).toThrow();
    expect(() => assertHomepageLogo('<img src="/_astro/paradise-fine-foods-logo.demo.webp">', dist, 'en')).not.toThrow();
  });

  test('scopes every carousel contract to the carousel subtree', () => {
    const detached = `${carousel('<div data-carousel-item></div><div data-carousel-item></div>')}
      <button data-carousel-previous aria-label="Previous product"></button>
      <button data-carousel-next aria-label="Next product"></button>
      <p aria-live="polite" aria-atomic="true" data-carousel-status data-carousel-status-template="Product {current} of {total}"></p>
      <div data-carousel-viewport tabindex="0"></div>`;
    expect(() => assertCarousel(detached, 'en')).toThrow();
    expect(() => assertCarousel(completeCarousel, 'en')).not.toThrow();
  });

  test('rejects external redirect targets while accepting the configured origin canonical', () => {
    const valid = '<meta http-equiv="refresh" content="0;url=/vi/products"><link rel="canonical" href="https://demo.paradisefinefoods.com/vi/products"><a href="/vi/products">Go</a>';
    expect(() => assertRedirect(valid, '/vi/products/', 'legacy')).not.toThrow();
    expect(() => assertRedirect(valid.replace('/vi/products\"', 'https://evil.test/vi/products\"'), '/vi/products/', 'legacy')).toThrow();
    expect(() => assertRedirect(valid.replace('https://demo.paradisefinefoods.com', 'https://evil.test'), '/vi/products/', 'legacy')).toThrow();
    expect(() => assertRedirect(valid.replace('<a href="/vi/products"', '<a href="https://evil.test/vi/products"'), '/vi/products/', 'legacy')).toThrow();
  });
});
