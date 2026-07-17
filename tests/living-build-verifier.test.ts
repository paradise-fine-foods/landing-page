import { describe, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  assertCarousel,
  assertHomepageLogo,
  assertRedirect,
  collectReachableJs,
  verifyBuiltLivingDesign,
} from './verify-built-living-design';

const fixtureDir = () => mkdtempSync(join(tmpdir(), 'living-build-verifier-'));
const carousel = (body: string) => `<section aria-roledescription="carousel" aria-label="Featured products" data-carousel>${body}</section>`;
const completeCarousel = carousel(`
  <button data-carousel-previous aria-label="Previous product"></button>
  <p aria-live="polite" aria-atomic="true" data-carousel-status data-carousel-status-template="Product {current} of {total}"></p>
  <button data-carousel-next aria-label="Next product"></button>
  <div data-carousel-viewport tabindex="0"><div data-carousel-item></div><div data-carousel-item></div></div>
`);
const viCarousel = `<section aria-roledescription="carousel" aria-label="Sản phẩm nổi bật" data-carousel>
  <button data-carousel-previous aria-label="Sản phẩm trước"></button>
  <p aria-live="polite" aria-atomic="true" data-carousel-status data-carousel-status-template="Sản phẩm {current} trên {total}"></p>
  <button data-carousel-next aria-label="Sản phẩm tiếp theo"></button>
  <div data-carousel-viewport tabindex="0"><div data-carousel-item></div><div data-carousel-item></div></div>
</section>`;
const writeFixtureFile = (dist: string, path: string, content: string) => {
  const file = join(dist, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, content);
};
const homepage = (locale: 'en' | 'vi', extras = '') => `<img src="/_astro/paradise-fine-foods-logo.demo.webp">${locale === 'en' ? completeCarousel : viCarousel}<script type="module" src="/_astro/LivingHero.astro_astro_type_script_index_0_lang.fixture.js"></script>${extras}`;
const redirectPage = (target: string) => `<meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://demo.paradisefinefoods.com${target}"><a href="${target}">Go</a>`;
const verifierFixture = (extras = '') => {
  const dist = fixtureDir();
  mkdirSync(join(dist, '_astro'));
  writeFileSync(join(dist, '_astro', 'paradise-fine-foods-logo.demo.webp'), 'logo');
  writeFileSync(join(dist, '_astro', 'LivingHero.astro_astro_type_script_index_0_lang.fixture.js'), 'export const ready = true;');
  writeFixtureFile(dist, 'en/index.html', homepage('en', extras));
  writeFixtureFile(dist, 'vi/index.html', homepage('vi', extras));
  for (const route of ['en/products', 'vi/products', 'en/brands', 'vi/brands', 'en/contact', 'vi/contact']) {
    writeFixtureFile(dist, `${route}/index.html`, '<!doctype html>');
  }
  for (const [legacy, target] of [
    ['vi/san-pham/index.html', '/vi/products/'],
    ['vi/san-pham/bo-lat-mau/index.html', '/vi/products/bo-lat-mau/'],
    ['vi/thuong-hieu/index.html', '/vi/brands/'],
    ['vi/thuong-hieu/nha-sua-maison/index.html', '/vi/brands/nha-sua-maison/'],
    ['vi/lien-he/index.html', '/vi/contact/'],
  ]) writeFixtureFile(dist, legacy, redirectPage(target));
  return dist;
};

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
    expect(() => assertHomepageLogo('<img src="/\\evil.test/_astro/paradise-fine-foods-logo.demo.webp">', dist, 'en')).toThrow();
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
    expect(() => assertRedirect(valid.replace('/vi/products\"', '/\\evil.test/vi/products\"'), '/vi/products/', 'legacy')).toThrow();
    expect(() => assertRedirect(valid.replace('https://demo.paradisefinefoods.com', 'https://evil.test'), '/vi/products/', 'legacy')).toThrow();
    expect(() => assertRedirect(valid.replace('<a href="/vi/products"', '<a href="https://evil.test/vi/products"'), '/vi/products/', 'legacy')).toThrow();
  });

  test('rejects an over-budget unique homepage initial JavaScript graph', () => {
    const dist = verifierFixture('<script type="module" src="/_astro/critical.js"></script>');
    writeFileSync(join(dist, '_astro', 'critical.js'), `export default ${JSON.stringify(randomBytes(125_000).toString('base64'))};`);
    expect(() => verifyBuiltLivingDesign(dist)).toThrow('Critical initial JavaScript');
  });

  test('rejects an over-budget unique homepage-authored SVG graph', () => {
    const dist = verifierFixture('<img src="/_astro/authored-graphic.svg"><img src="/_astro/authored-graphic.svg"><img src="https://example.test/external.svg"><img src="data:image/svg+xml,ignored"><img src="/_astro/%2e%2e/ignored.svg">');
    writeFileSync(join(dist, '_astro', 'authored-graphic.svg'), `<svg><!--${randomBytes(85_000).toString('base64')}--></svg>`);
    expect(() => verifyBuiltLivingDesign(dist)).toThrow('Homepage authored SVG graphics');
  });

  test('rejects an over-budget unique inline homepage module body', () => {
    const dist = verifierFixture(`<script type="module">export default ${JSON.stringify(randomBytes(125_000).toString('base64'))};</script>`);
    expect(() => verifyBuiltLivingDesign(dist)).toThrow('Critical initial JavaScript');
  });

  test('rejects an over-budget standalone modulepreload graph with query and hash', () => {
    const dist = verifierFixture('<link rel="modulepreload" href="/_astro/critical-preload.js?cache=1#entry">');
    writeFileSync(join(dist, '_astro', 'critical-preload.js'), `export default ${JSON.stringify(randomBytes(125_000).toString('base64'))};`);
    expect(() => verifyBuiltLivingDesign(dist)).toThrow('Critical initial JavaScript');
  });
});
