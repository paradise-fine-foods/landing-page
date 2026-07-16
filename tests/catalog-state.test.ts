import { describe, expect, test } from 'bun:test';

import { deriveCatalogState } from '../src/lib/catalog/catalog-state';
import { buildProductSearchText, filterProducts } from '../src/lib/catalog/filter-products';
import { getProducts } from '../src/lib/cms/queries';
import type { ProductQuery } from '../src/lib/cms/types';
import { ui } from '../src/lib/i18n/ui';

const records = [
  {
    id: 'butter',
    search: 'Bơ lát Maison Laitière cán lớp',
    categories: ['butter'],
    brand: 'maison-laitiere',
    applications: ['lamination', 'viennoiserie'],
  },
  {
    id: 'cream',
    search: 'Whipping cream Atelier Crème desserts',
    categories: ['cream'],
    brand: 'atelier-creme',
    applications: ['whipping', 'desserts'],
  },
] as const;

describe('catalog DOM state', () => {
  test('initializes an exact localized category query and applies the resulting state once', async () => {
    const catalogState = await import('../src/lib/catalog/catalog-state');
    const calls: string[] = [];
    const view = {
      selectCategory: (id: string) => { calls.push(`select:${id}`); },
      update: () => { calls.push('update'); },
    };
    const options = [
      { id: 'butter', slug: 'bo' },
      { id: 'cream', slug: 'kem-sua' },
    ];

    expect(catalogState.initializeCatalogCategory(view, 'bo', options)).toBe(true);
    expect(calls).toEqual(['select:butter', 'update']);
    expect(catalogState.initializeCatalogCategory(view, 'BO', options)).toBe(false);
    expect(catalogState.initializeCatalogCategory(view, null, options)).toBe(false);
    expect(calls).toEqual(['select:butter', 'update']);
  });

  test('normalizes diacritics and combines populated controls with AND semantics', () => {
    expect(
      deriveCatalogState(records, {
        search: 'bo',
        category: 'butter',
        brand: 'maison-laitiere',
        application: 'lamination',
      }),
    ).toEqual({ visibleIds: ['butter'], count: 1, empty: false });
  });

  test('folds Vietnamese Đ/đ so ASCII search finds displayed text', () => {
    expect(
      deriveCatalogState(
        [{ id: 'whipping', search: 'Đánh bông', categories: [], brand: '', applications: [] }],
        { search: 'danh' },
      ),
    ).toEqual({ visibleIds: ['whipping'], count: 1, empty: false });
  });

  test('finds Vietnamese products by accented and ASCII localized application labels', async () => {
    const products = await getProducts('vi');
    const records = products.map((product) => ({
      id: product.id,
      search: buildProductSearchText(product, ui.vi.product.applicationNames),
      categories: product.categories.map(({ id }) => id),
      brand: product.brand.id,
      applications: product.applications,
    }));

    for (const search of ['cán lớp', 'can lop']) {
      expect(deriveCatalogState(records, { search }).visibleIds).toContain(
        'cultured-butter-sheet',
      );
    }
  });

  test('matches filterProducts for scalar and multi-value filters', async () => {
    const products = await getProducts('en');
    const records = products.map((product) => ({
      id: product.id,
      search: buildProductSearchText(product, ui.en.product.applicationNames),
      categories: product.categories.map(({ id }) => id),
      brand: product.brand.id,
      applications: product.applications,
    }));
    const cases = [
      {},
      { search: 'cream' },
      { brand: ['maison-laitiere', 'atelier-creme'] },
      { category: ['butter', 'cream'], application: ['lamination', 'whipping'] },
      {
        search: 'cream',
        brand: ['formagerie-nord', 'atelier-creme'],
        category: ['cheese', 'cream'],
        application: ['whipping', 'cheesecake'],
      },
      { search: 'not-present', brand: ['maison-laitiere', 'atelier-creme'] },
    ] satisfies ProductQuery[];

    for (const query of cases) {
      expect(deriveCatalogState(records, query).visibleIds).toEqual(
        filterProducts(products, query).map(({ id }) => id),
      );
    }

    expect(
      deriveCatalogState(records, {
        brand: 'atelier-creme',
        category: 'cream',
        application: 'whipping',
      }).visibleIds,
    ).toEqual(
      filterProducts(products, {
        brand: ['atelier-creme'],
        category: ['cream'],
        application: ['whipping'],
      }).map(({ id }) => id),
    );
  });

  test('reports an empty state for incompatible controls', () => {
    expect(
      deriveCatalogState(records, { search: 'cream', category: 'butter' }),
    ).toEqual({ visibleIds: [], count: 0, empty: true });
  });

  test('an empty query restores the full server-rendered catalog', () => {
    expect(deriveCatalogState(records, {})).toEqual({
      visibleIds: ['butter', 'cream'],
      count: 2,
      empty: false,
    });
  });
});
