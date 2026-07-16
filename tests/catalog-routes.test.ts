import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getProducts, getProductBySlug } from '../src/lib/cms/queries';
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
      source('src/pages/en/products/index.astro'),
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

  test('uses typed static paths and only the vendor-neutral query boundary', () => {
    const routeFiles = [
      'src/pages/en/products/index.astro',
      'src/pages/en/products/[slug].astro',
      'src/pages/vi/products/index.astro',
      'src/pages/vi/products/[slug].astro',
    ].map(source);

    for (const route of routeFiles) {
      expect(route).toContain('lib/cms/queries');
      expect(route).not.toMatch(/demo-data|demoProducts|demoCategories|demoBrands/);
    }
    for (const detailRoute of [routeFiles[1], routeFiles[3]]) {
      expect(detailRoute).toContain('satisfies GetStaticPaths');
      expect(detailRoute).toContain('InferGetStaticParamsType');
      expect(detailRoute).toContain('InferGetStaticPropsType');
      expect(detailRoute).toContain("params: { slug: product.slug }");
    }
  });
});
