import { describe, expect, test } from 'bun:test';

import { getProductCardMetadata } from '../src/lib/catalog/product-card';
import { getProducts } from '../src/lib/cms/queries';
import { ui } from '../src/lib/i18n/ui';

describe('ProductCard metadata', () => {
  test('combines only mapped category and application values', async () => {
    const product = (await getProducts('en'))[0]!;

    expect(getProductCardMetadata(product, ui.en.product.applicationNames)).toEqual([
      product.categories[0]!.name,
      ui.en.product.applicationNames[product.applications[0]!]!,
    ]);
  });

  test('omits empty and unmapped values without separators or undefined', async () => {
    const product = {
      ...(await getProducts('en'))[0]!,
      categories: [],
      applications: ['not-mapped'],
    };

    const metadata = getProductCardMetadata(product, ui.en.product.applicationNames);
    expect(metadata).toEqual([]);
    expect(metadata.join(' · ')).not.toContain('undefined');
  });
});
