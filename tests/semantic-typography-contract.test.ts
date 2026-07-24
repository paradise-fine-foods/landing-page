import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('semantic typography contracts', () => {
  test('binds card heading scales to their rendered semantic level', () => {
    const productCard = source('src/components/catalog/ProductCard.astro');
    const brandCard = source('src/components/brands/BrandCard.astro');

    expect(productCard).toContain('.product-card h2 { font-size: var(--text-h2); }');
    expect(productCard).toContain('.product-card h3 { font-size: var(--text-h3); }');
    expect(brandCard).toContain('.brand-card h2 { font-size: var(--text-h2);');
    expect(brandCard).toContain('.brand-card h3 { font-size: var(--text-h3);');
  });

  test('uses the level-two token for the catalog empty-state heading', () => {
    expect(source('src/components/catalog/ProductGrid.astro'))
      .toContain('.catalog-empty h2 { font-size: var(--text-h2); }');
  });

  test('loads the Nunito 600 face required by the 404 controls', () => {
    const page = source('src/pages/404.astro');

    expect(page).toContain("import '@fontsource/nunito/600.css';");
    expect(page).toContain('font-weight: 600');
  });
});
