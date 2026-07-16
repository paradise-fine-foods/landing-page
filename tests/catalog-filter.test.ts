import { describe, expect, test } from 'bun:test';

import { filterProducts } from '../src/lib/catalog/filter-products';
import { getProducts } from '../src/lib/cms/queries';

describe('filterProducts', () => {
  test('matches search text without case or diacritics', async () => {
    const products = await getProducts('vi');

    expect(filterProducts(products, { search: 'bo' }).map((product) => product.id)).toContain(
      'cultured-butter-sheet',
    );
  });

  test('combines brand and category filters with AND semantics', async () => {
    const products = await getProducts('en');

    expect(
      filterProducts(products, {
        brand: ['formagerie-nord'],
        category: ['cheese'],
      }).map((product) => product.id),
    ).toEqual(['cream-cheese-block', 'mozzarella-shred']);
  });

  test('uses OR semantics for values within one filter', async () => {
    const products = await getProducts('en');

    expect(
      filterProducts(products, { brand: ['maison-laitiere', 'atelier-creme'] }).length,
    ).toBeGreaterThanOrEqual(4);
  });

  test('filters by applications', async () => {
    const products = await getProducts('en');

    expect(
      filterProducts(products, { application: ['lamination'] }).map(
        (product) => product.id,
      ),
    ).toEqual(['cultured-butter-sheet']);
  });

  test('returns an empty array for a query with no matches', async () => {
    const products = await getProducts('en');

    expect(
      filterProducts(products, {
        search: 'mascarpone',
        category: ['butter'],
      }),
    ).toEqual([]);
  });
});
