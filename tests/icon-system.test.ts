import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('site icon system', () => {
  test('configures Astro Icon with the Lucide Iconify set', async () => {
    const config = await read('../astro.config.mjs');
    const packageJson = await read('../package.json');

    expect(config).toContain("import icon from 'astro-icon';");
    expect(config).toContain('icon()');
    expect(packageJson).toContain('"astro-icon"');
    expect(packageJson).toContain('"@iconify-json/lucide"');
  });

  test('provides a shared accessible icon wrapper and replaces targeted text glyphs', async () => {
    const icon = await read('../src/components/global/Icon.astro');
    const sources = await Promise.all([
      read('../src/components/global/Header.astro'),
      read('../src/components/global/ButtonLink.astro'),
      read('../src/components/global/FloatingFormRail.astro'),
      read('../src/components/global/Breadcrumbs.astro'),
      read('../src/components/global/LanguageSwitcher.astro'),
      read('../src/components/sections/ChannelPathways.astro'),
      read('../src/components/brands/BrandCard.astro'),
      read('../src/components/sections/FeaturedBrands.astro'),
      read('../src/components/catalog/ProductCard.astro'),
      read('../src/components/catalog/ProductDetail.astro'),
      read('../src/components/sections/FeaturedProducts.astro'),
      read('../src/components/catalog/CatalogFilters.astro'),
      read('../src/pages/404.astro'),
    ]);
    const combined = sources.join('\n');

    expect(icon).toContain("import { Icon } from 'astro-icon/components';");
    expect(icon).toContain('name: string');
    expect(icon).toContain('ariaHidden');
    expect(combined).toContain('<Icon');
    expect(combined).not.toContain("<span aria-hidden=\"true\">↗</span>");
    expect(combined).not.toContain("<span aria-hidden=\"true\">→</span>");
    expect(combined).not.toContain("<b aria-hidden=\"true\">→</b>");
  });
});
