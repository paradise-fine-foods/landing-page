import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getProducts, getProductBySlug } from './fixtures/directus';
import {
  buildProductRouteMaps,
  findProductRoute,
  productDetailPath,
} from '../src/lib/catalog/routes';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('localized product routes', () => {
  test('maps every localized CMS product to its detail URL', async () => {
    const [english, vietnamese] = await Promise.all([
      getProducts('en'),
      getProducts('vi'),
    ]);

    expect(english.map((product) => productDetailPath('en', product))).toEqual(
      english.map((product) => `/en/products/${product.slug}/`),
    );
    expect(vietnamese.map((product) => productDetailPath('vi', product))).toEqual(
      vietnamese.map((product) => `/vi/products/${product.slug}/`),
    );
  });

  test('builds reciprocal counterparts by stable product ID', async () => {
    const [english, vietnamese] = await Promise.all([
      getProducts('en'),
      getProducts('vi'),
    ]);
    const maps = buildProductRouteMaps(english, vietnamese);

    expect(maps).toHaveLength(english.length);
    for (const map of maps) {
      expect(findProductRoute(maps, map.en, 'vi')).toBe(map.vi);
      expect(findProductRoute(maps, map.vi, 'en')).toBe(map.en);
    }
  });

  test('does not invent routes for unknown slugs', async () => {
    expect(await getProductBySlug('en', 'not-a-product')).toBeUndefined();
    expect(findProductRoute([], '/en/products/not-a-product/', 'vi')).toBeUndefined();
  });

  test('keeps the exact progressive filter DOM contract', () => {
    const catalogSource = [
      source('src/components/catalog/CatalogFilters.astro'),
      source('src/components/catalog/ProductGrid.astro'),
      source('src/pages/[locale]/products/index.astro'),
    ].join('\n');

    for (const attribute of [
      'data-catalog',
      'data-product-card',
      'data-filter-search',
      'data-filter-category',
      'data-filter-brand',
      'data-filter-application',
      'data-result-count',
      'data-empty-state',
      'data-reset-filters',
    ]) {
      expect(catalogSource).toContain(attribute);
    }
    expect(catalogSource).toContain('aria-live="polite"');
    expect(catalogSource).toContain('<noscript>');
  });

  test('uses validated runtime params and only the vendor-neutral query boundary', () => {
    const routeFiles = [
      'src/pages/[locale]/products/index.astro',
      'src/pages/[locale]/products/[slug].astro',
    ].map(source);

    for (const route of routeFiles) {
      expect(route).toContain('lib/cms/queries');
      expect(route).not.toMatch(/demo-data|demoProducts|demoCategories|demoBrands/);
    }
    const detailRoute = routeFiles[1]!;
    expect(detailRoute).toContain('Astro.params');
    expect(detailRoute).toContain('isLocale(localeParam)');
    expect(detailRoute).toContain('getProductBySlug(locale, slug)');
    expect(detailRoute).toContain('counterpartProducts.find(({ id }) => id === product.id)');
    expect(detailRoute).toContain("return Astro.rewrite('/404')");
    expect(detailRoute).not.toContain('getStaticPaths');
  });

  test('keeps catalog controls compact and reserves orange for product facts', () => {
    const filters = source('src/components/catalog/CatalogFilters.astro');
    const metadata = source('src/components/catalog/ProductMetadata.astro');
    const grid = source('src/components/catalog/ProductGrid.astro');

    expect(filters).toContain('border-block: 1px solid var(--color-brushed-steel)');
    expect(filters).toContain('min-block-size: 2.75rem');
    expect(filters).not.toContain('background: var(--color-cold-paper)');
    expect(metadata).toContain('border-inline-start: 2px solid var(--color-paradise-orange)');
    expect(grid).toContain('border-block: 1px solid var(--color-brushed-steel)');
    expect(grid).not.toContain('background: var(--color-cold-paper)');
  });

  test('reserves state-aware control clearance beside collapsed and expanded rails', () => {
    const filters = source('src/components/catalog/CatalogFilters.astro');

    expect(filters).toContain('padding-inline-end: calc(2.75rem + 1rem + env(safe-area-inset-right, 0px))');
    expect(filters).toContain(":global(html:has([data-floating-rail][data-expanded='true'])) .catalog-filters { padding-inline-end: calc(14.75rem + 1rem + env(safe-area-inset-right, 0px)); }");
    expect(filters).toContain("@media (max-width: 48rem) { :global(html:has([data-floating-rail][data-expanded='true'])) .catalog-filters { padding-inline-end: calc(2.75rem + 1rem + env(safe-area-inset-right, 0px)); } }");
  });
});
