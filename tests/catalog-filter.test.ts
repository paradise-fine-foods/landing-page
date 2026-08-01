import { describe, expect, test } from 'bun:test';

import { buildProductSearchText, filterProducts } from '../src/lib/catalog/filter-products';
import { getProducts } from './fixtures/directus';

describe('filterProducts', () => {
  test('matches search text without case or diacritics', async () => {
    const products = await getProducts('vi');

    expect(filterProducts(products, { search: 'bo' }).map((product) => product.id)).toContain(
      'cultured-butter-sheet',
    );
  });

  test('folds Vietnamese Đ/đ so ASCII search finds displayed text', async () => {
    const products = await getProducts('vi');

    expect(filterProducts(products, { search: 'danh' }).map(({ id }) => id)).toContain(
      'whipping-cream-35',
    );
  });

  test('indexes localized application labels alongside stable keys', async () => {
    const products = await getProducts('vi');
    const butter = products.find(({ id }) => id === 'cultured-butter-sheet');

    expect(butter).toBeDefined();
    const search = buildProductSearchText(butter!);
    expect(search).toContain('lamination');
    expect(search).toContain('Cán lớp');
  });

  test('indexes localized application options when Directus uses UUID IDs', async () => {
    const product = (await getProducts('vi'))[0]!;
    const applicationId = '8c60be88-16e5-4a11-b984-c433bf1c9172';
    const uuidProduct = {
      ...product,
      applications: [applicationId],
      applicationOptions: [{ id: applicationId, slug: 'viennoiserie', name: 'Kỹ thuật viennoiserie', description: '' }],
    };

    expect(filterProducts([uuidProduct], { search: 'viennoiserie' }).map(({ id }) => id)).toEqual([
      uuidProduct.id,
    ]);
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
