import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('Paradise branding assets', () => {
  test('keeps local provenance-backed partner assets in the typed CMS boundary', async () => {
    const types = await read('../src/lib/cms/types.ts');
    const data = await read('../src/lib/cms/demo-data.ts');
    const queries = await read('../src/lib/cms/queries.ts');
    const sources = await read('../src/assets/brand/paradise/SOURCES.md');

    expect(types).toContain('interface BrandingAsset');
    expect(types).toContain('sourceUrl: string');
    expect(data).toContain('demoBrandingAssets');
    expect(data).toContain("'mega-mart'");
    expect(queries).toContain('partners: demoBrandingAssets.map');
    expect(sources).toContain('Source URL');
    expect(sources).toContain('paradisefinefoods.com/wp-content/uploads');
  });

  test('renders local branding in shared chrome and the bilingual partner strip', async () => {
    const layout = await read('../src/layouts/SiteLayout.astro');
    const header = await read('../src/components/global/Header.astro');
    const footer = await read('../src/components/global/Footer.astro');
    const notFound = await read('../src/pages/404.astro');
    const partnerStrip = await read('../src/components/sections/PartnerStrip.astro');
    const home = await read('../src/pages/en/index.astro');

    for (const source of [layout, header, footer, notFound]) {
      expect(source).toContain('paradise-fine-foods-logo.png');
    }
    expect(layout).toContain('rel="icon"');
    expect(layout).toContain('socialImage');
    expect(partnerStrip).toContain('data-partner-strip');
    expect(partnerStrip).toContain('partner.alt');
    expect(home).toContain('<PartnerStrip');
  });
});
