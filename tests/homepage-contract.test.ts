import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../src/lib/i18n/ui';
import { getProducts } from '../src/lib/cms/queries';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('reviewed homepage contracts', () => {
  test('defines four localized operational pillars for credibility and service proof', () => {
    for (const locale of ['en', 'vi'] as const) {
      const pillars = ui[locale].home.operationalPillars;
      expect(pillars).toHaveLength(4);
      expect(new Set(pillars.map(({ title }) => title)).size).toBe(4);
      expect(pillars.every(({ description }) => description.length > 20)).toBe(true);
    }
  });

  test('defines four distinct localized channel values', () => {
    for (const locale of ['en', 'vi'] as const) {
      const channels = ui[locale].home.channels;
      expect(Object.keys(channels)).toEqual(['retail', 'horeca', 'bakery', 'ecommerce']);
      expect(new Set(Object.values(channels).map(({ description }) => description)).size).toBe(4);
    }
  });

  test('category discovery is image-led, count-aware, and asymmetric', () => {
    const component = source('src/components/sections/CategoryDiscovery.astro');
    expect(component).toContain('category.image.src');
    expect(component).toContain('categoryCounts[category.id]');
    expect(component).toContain('category-discovery__feature');
    expect(component).not.toContain('repeat(4, 1fr)');
  });

  test('featured brands distinguishes one producer story from the secondary list', () => {
    const component = source('src/components/sections/FeaturedBrands.astro');
    expect(component).toContain('selectedBrandProducts');
    expect(component).toContain('featured-brands__story');
    expect(component).toContain('remainingBrands');
  });

  test('product cards use a square stage and buyer metadata', () => {
    const component = source('src/components/catalog/ProductCard.astro');
    const metadata = source('src/lib/catalog/product-card.ts');
    expect(component).toContain('aspect-ratio: 1 / 1');
    expect(component).toContain('product.packFormat');
    expect(component).toContain('product.origin');
    expect(component).toContain('getProductCardMetadata');
    expect(metadata).toContain('product.categories[0]');
    expect(metadata).toContain('product.applications[0]');
    expect(component).not.toContain('{product.description}');
  });

  test('every CMS application key has a distinct Vietnamese display name', async () => {
    const products = await getProducts('vi');
    const applicationKeys = [...new Set(products.flatMap(({ applications }) => applications))];

    for (const key of applicationKeys) {
      expect(ui.vi.product.applicationNames[key]).toBeString();
      expect(ui.vi.product.applicationNames[key]).not.toBe(key);
    }
  });

  test('pages create described channel destinations and count categories from CMS products', () => {
    for (const locale of ['en', 'vi']) {
      const page = source(`src/pages/${locale}/index.astro`);
      for (const interest of ['retail', 'horeca', 'bakery', 'ecommerce']) {
        expect(page).toContain(`interest=${interest}`);
      }
      expect(page).toContain('categoryCounts');
      expect(page).toContain('product.categories.some');
      expect(page).toContain('product.brand.id === selectedBrand.id');
    }
  });

  test('utility labels are localized and navigation never uses the display face', () => {
    const files = [
      'src/components/global/DemoNotice.astro',
      'src/components/sections/Hero.astro',
      'src/components/sections/ServiceProof.astro',
      'src/components/sections/FinalCta.astro',
    ].map(source).join('\n');
    expect(files).not.toMatch(/\b(COLD|CONTROLLED|OPEN LINE|Review)\b/);

    const header = source('src/components/global/Header.astro');
    expect(header).toContain('.site-header--enhanced .primary-nav li a');
    expect(header).not.toMatch(/\.primary-nav[^}]*font-family:\s*var\(--font-display\)/s);
  });
});
