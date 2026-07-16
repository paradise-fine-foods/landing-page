import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getBrandBySlug, getBrands } from '../src/lib/cms/queries';
import {
  brandDetailPath,
  buildBrandRouteMaps,
  findBrandRoute,
} from '../src/lib/brands/routes';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('localized brand routes', () => {
  test('resolves all localized slugs to the same three stable records', async () => {
    const [english, vietnamese] = await Promise.all([getBrands('en'), getBrands('vi')]);

    expect(english).toHaveLength(3);
    expect(vietnamese.map(({ id }) => id)).toEqual(english.map(({ id }) => id));

    for (const brand of english) {
      expect(brand.slug).toBeTruthy();
      expect((await getBrandBySlug('en', brand.slug))?.id).toBe(brand.id);
    }
    for (const brand of vietnamese) {
      expect(brand.slug).toBeTruthy();
      expect((await getBrandBySlug('vi', brand.slug))?.id).toBe(brand.id);
    }
  });

  test('builds reciprocal detail counterparts by stable brand ID', async () => {
    const [english, vietnamese] = await Promise.all([getBrands('en'), getBrands('vi')]);
    const maps = buildBrandRouteMaps(english, vietnamese);

    expect(maps).toHaveLength(3);
    for (const map of maps) {
      expect(findBrandRoute(maps, map.en, 'vi')).toBe(map.vi);
      expect(findBrandRoute(maps, map.vi, 'en')).toBe(map.en);
    }
    expect(brandDetailPath('en', english[0]!)).toBe(`/en/brands/${english[0]!.slug}/`);
    expect(brandDetailPath('vi', vietnamese[0]!)).toBe(`/vi/thuong-hieu/${vietnamese[0]!.slug}/`);
  });

  test('does not invent routes or records for unknown slugs', async () => {
    expect(await getBrandBySlug('en', 'not-a-brand')).toBeUndefined();
    expect(findBrandRoute([], '/en/brands/not-a-brand/', 'vi')).toBeUndefined();
  });

  test('keeps routes behind typed CMS queries and normalized static props', () => {
    const routes = [
      'src/pages/en/brands/index.astro',
      'src/pages/en/brands/[slug].astro',
      'src/pages/vi/thuong-hieu/index.astro',
      'src/pages/vi/thuong-hieu/[slug].astro',
    ].map(source);

    for (const route of routes) {
      expect(route).toContain('lib/cms/queries');
      expect(route).not.toMatch(/demo-data|demoProducts|demoCategories|demoBrands/);
    }
    for (const detailRoute of [routes[1], routes[3]]) {
      expect(detailRoute).toContain('satisfies GetStaticPaths');
      expect(detailRoute).toContain('InferGetStaticParamsType');
      expect(detailRoute).toContain('InferGetStaticPropsType');
      expect(detailRoute).toContain('params: { slug: brand.slug }');
    }
  });

  test('centralizes locale copy and preserves accessible detail structure', () => {
    const detail = source('src/components/brands/BrandDetail.astro');
    const routeSources = [
      source('src/pages/en/brands/index.astro'),
      source('src/pages/en/brands/[slug].astro'),
      source('src/pages/vi/thuong-hieu/index.astro'),
      source('src/pages/vi/thuong-hieu/[slug].astro'),
    ].join('\n');

    expect(detail).toContain('copy.brand.demoNotice');
    expect(detail).toContain('headingLevel="h3"');
    expect(detail).toContain('<h1>{brand.name}</h1>');
    expect(routeSources.match(/headingLevel="h2"/g)).toHaveLength(2);
    expect(routeSources).not.toMatch(/locale\s*===|locale\s*\?/);
  });
});
