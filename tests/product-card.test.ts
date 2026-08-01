import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import icon from 'astro-icon';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';

import { resolveConfig } from '../node_modules/astro/dist/core/config/config.js';
import { createSettings } from '../node_modules/astro/dist/core/config/settings.js';
import { AstroLogger } from '../node_modules/astro/dist/core/logger/core.js';
import { runHookConfigSetup } from '../node_modules/astro/dist/integrations/hooks.js';
import astroPlugin from '../node_modules/astro/dist/vite-plugin-astro/index.js';
import { getApplicationNames } from '../src/lib/catalog/filter-products';
import { getProductCardMetadata } from '../src/lib/catalog/product-card';
import { getProducts } from './fixtures/directus';
import { ui } from '../src/lib/i18n/ui';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
let vite: ViteDevServer;

beforeAll(async () => {
  const { astroConfig } = await resolveConfig({ root, configFile: false, integrations: [icon()] }, 'dev');
  let settings = await createSettings(astroConfig, 'silent', root);
  const logger = new AstroLogger({ level: 'silent', destination: { write: () => undefined } });
  settings = await runHookConfigSetup({ settings, command: 'dev', logger });
  vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
    plugins: [...(settings.config.vite.plugins ?? []), astroPlugin({ settings, logger })],
  });
}, 20_000);

afterAll(async () => {
  await vite?.close();
});

const component = async (path: string) => (await vite.ssrLoadModule(path)).default;
const visibleText = (html: string) => html.replace(/<[^>]*>/g, ' ');

describe('ProductCard metadata', () => {
  test('renders localized application options instead of UUIDs in filters, cards, and details', async () => {
    const base = (await getProducts('en'))[0]!;
    const applicationId = '8c60be88-16e5-4a11-b984-c433bf1c9172';
    const applicationLabel = 'Viennoiserie technique';
    const product = {
      ...base,
      applications: [applicationId],
      applicationOptions: [{ id: applicationId, slug: 'viennoiserie', name: applicationLabel, description: '' }],
    };
    const applicationNames = getApplicationNames([product]);
    const container = await AstroContainer.create();
    const [filters, card, detail] = await Promise.all([
      container.renderToString(await component('/src/components/catalog/CatalogFilters.astro'), {
        props: {
          categories: product.categories,
          brands: [product.brand],
          applications: product.applications,
          applicationNames,
          copy: ui.en.catalog,
          initialCount: 1,
        },
      }),
      container.renderToString(await component('/src/components/catalog/ProductCard.astro'), {
        props: { product, locale: 'en' },
      }),
      container.renderToString(await component('/src/components/catalog/ProductDetail.astro'), {
        props: { product, copy: ui.en, enquiryPath: '/en/contact/customer/' },
      }),
    ]);

    expect(filters).toMatch(new RegExp(`<option(?=[^>]*value="${applicationId}")[^>]*>${applicationLabel}</option>`));
    for (const html of [filters, card, detail]) {
      expect(visibleText(html)).toContain(applicationLabel);
      expect(visibleText(html)).not.toContain(applicationId);
    }
  });

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
