import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getProductCardMetadata } from '../src/lib/catalog/product-card';
import { getProducts } from './fixtures/directus';
import { ui } from '../src/lib/i18n/ui';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

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
  test('uses an unmasked square media stage with neutral metadata separators', () => {
    const card = source('src/components/catalog/ProductCard.astro');

    expect(card).toContain('class="product-card__media"');
    expect(card).toContain('aspect-ratio: 1 / 1');
    expect(card).toContain('background: var(--color-cold-paper)');
    expect(card).toContain('border-block-start: 1px solid var(--color-brushed-steel)');
    expect(card).not.toContain('product-card__organic-media');
    expect(card).not.toMatch(/product-card__media::before|color-paradise-orange/);
  });

  test('keeps its image link exposed with the product image name', () => {
    const card = source('src/components/catalog/ProductCard.astro');

    expect(card).toContain('class="product-card__media"');
    expect(card).toContain('alt={product.image.alt}');
    expect(card).not.toMatch(/<a class="product-card__media"[^>]*aria-hidden/);
  });
});
