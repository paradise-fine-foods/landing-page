import { describe, expect, test } from 'bun:test';

import {
  getBrandBySlug,
  getBrands,
  getCategories,
  getFeaturedContent,
  getGlobalSettings,
  getProductBySlug,
  getProducts,
} from '../src/lib/cms/queries';

describe('CMS adapter', () => {
  test('returns a stable localized demo catalog', async () => {
    const products = await getProducts('en');

    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(products.every((item) => item.demo === true)).toBe(true);
    expect(products.every((item) => item.slug && item.name && item.storage.label)).toBe(true);
    expect((await getProducts('vi')).map((item) => item.id)).toEqual(
      products.map((item) => item.id),
    );
    expect((await getProductBySlug('vi', 'bo-lat-mau'))?.id).toBe(
      'cultured-butter-sheet',
    );
    expect((await getBrands('en')).length).toBeGreaterThanOrEqual(3);
    expect((await getFeaturedContent('en')).hero.product.id).toBe(
      'cultured-butter-sheet',
    );
  });

  test('localizes settings, categories, brands, and featured editorial content', async () => {
    expect((await getGlobalSettings('en')).demoNotice).toContain('fictional');
    expect((await getGlobalSettings('vi')).siteName).not.toBe(
      (await getGlobalSettings('en')).siteName,
    );
    expect((await getCategories('en')).map((category) => category.id)).toEqual([
      'butter',
      'cream',
      'cheese',
      'pastry',
    ]);
    expect((await getBrandBySlug('vi', 'nha-sua-maison'))?.id).toBe(
      'maison-laitiere',
    );
    expect((await getFeaturedContent('vi')).editorial.image.alt).toBeTruthy();
  });

  test('returns undefined for unknown localized slugs', async () => {
    expect(await getProductBySlug('en', 'missing-product')).toBeUndefined();
    expect(await getBrandBySlug('vi', 'missing-brand')).toBeUndefined();
  });

  test('returns fresh arrays and records', async () => {
    const first = await getProducts('en');
    const second = await getProducts('en');

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0].benefits).not.toBe(second[0].benefits);
  });
});
