import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

const localizedRoutes = [
  'src/pages/[locale]/index.astro',
  'src/pages/[locale]/products/index.astro',
  'src/pages/[locale]/products/[slug].astro',
  'src/pages/[locale]/brands/index.astro',
  'src/pages/[locale]/brands/[slug].astro',
  'src/pages/[locale]/blogs/index.astro',
  'src/pages/[locale]/blogs/[slug].astro',
  'src/pages/[locale]/contact.astro',
  'src/pages/[locale]/contact/[mode].astro',
];

describe('localized SSR routes', () => {
  test('resolves every localized page from validated request params', () => {
    for (const routePath of localizedRoutes) {
      const route = source(routePath);

      expect(route).toContain('Astro.params');
      expect(route).toContain('isLocale');
      expect(route).not.toContain('getStaticPaths');
      expect(route).not.toContain('Astro.props');
      expect(route).not.toContain('InferGetStatic');
    }
  });

  test('resolves detail content at request time and handles unknown params', () => {
    const product = source('src/pages/[locale]/products/[slug].astro');
    const brand = source('src/pages/[locale]/brands/[slug].astro');
    const blog = source('src/pages/[locale]/blogs/[slug].astro');
    const contactMode = source('src/pages/[locale]/contact/[mode].astro');

    expect(product).toContain('getProductBySlug(locale, slug)');
    expect(brand).toContain('getBrandBySlug(locale, slug)');
    expect(blog).toContain('getBlogPostBySlug(locale, slug)');
    expect(contactMode).toContain('isContactMode(modeParam)');

    for (const route of [product, brand, blog, contactMode]) {
      expect(route).toContain("return Astro.rewrite('/404')");
    }
  });
});
