import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getBrandBySlug, getBrands, normalizeBrandAccent } from '../src/lib/cms/queries';
import { brandAccentTokens } from '../src/lib/cms/types';
import {
  brandDetailPath,
  buildBrandRouteMaps,
  findBrandRoute,
} from '../src/lib/brands/routes';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');
const expectedBrands = [
  { id: 'maison-laitiere', en: 'maison-laitiere', vi: 'nha-sua-maison' },
  { id: 'atelier-creme', en: 'atelier-creme', vi: 'xuong-kem' },
  { id: 'formagerie-nord', en: 'formagerie-nord', vi: 'xuong-pho-mai-bac' },
] as const;

describe('localized brand routes', () => {
  test('resolves all localized slugs to the same three stable records', async () => {
    const [english, vietnamese] = await Promise.all([getBrands('en'), getBrands('vi')]);

    expect(english.map(({ id, slug }) => ({ id, slug }))).toEqual(
      expectedBrands.map(({ id, en: slug }) => ({ id, slug })),
    );
    expect(vietnamese.map(({ id, slug }) => ({ id, slug }))).toEqual(
      expectedBrands.map(({ id, vi: slug }) => ({ id, slug })),
    );

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
    expect(maps).toEqual(expectedBrands.map(({ en, vi }) => ({
      en: `/en/brands/${en}/`,
      vi: `/vi/brands/${vi}/`,
    })));
    for (const map of maps) {
      expect(findBrandRoute(maps, map.en, 'vi')).toBe(map.vi);
      expect(findBrandRoute(maps, map.vi, 'en')).toBe(map.en);
    }
    expect(brandDetailPath('en', english[0]!)).toBe(`/en/brands/${english[0]!.slug}/`);
    expect(brandDetailPath('vi', vietnamese[0]!)).toBe(`/vi/brands/${vietnamese[0]!.slug}/`);
  });

  test('does not invent routes or records for unknown slugs', async () => {
    expect(await getBrandBySlug('en', 'not-a-brand')).toBeUndefined();
    expect(await getBrandBySlug('vi', 'khong-co-thuong-hieu')).toBeUndefined();
    const maps = buildBrandRouteMaps(await getBrands('en'), await getBrands('vi'));
    expect(findBrandRoute(maps, '/en/brands/not-a-brand/', 'vi')).toBeUndefined();
    expect(findBrandRoute(maps, '/vi/brands/khong-co-thuong-hieu/', 'en')).toBeUndefined();
  });

  test('normalizes CMS accents to a closed, injection-safe token set', async () => {
    expect(brandAccentTokens).toEqual(['butter', 'bordeaux', 'cold-chain']);
    for (const token of brandAccentTokens) expect(normalizeBrandAccent(token)).toBe(token);
    for (const unsafe of ['#fff; color:red', '', 'unknown', undefined, null, 42, {}]) {
      expect(normalizeBrandAccent(unsafe)).toBe('butter');
    }

    const first = await getBrands('en');
    const second = await getBrands('en');
    expect(first.map(({ accent }) => accent)).toEqual(['butter', 'bordeaux', 'cold-chain']);
    expect(first.every((brand, index) => brand !== second[index])).toBe(true);
  });

  test('keeps routes behind typed CMS queries and normalized static props', () => {
    const routes = [
      'src/pages/[locale]/brands/index.astro',
      'src/pages/[locale]/brands/[slug].astro',
    ].map(source);

    for (const route of routes) {
      expect(route).toContain('lib/cms/queries');
      expect(route).not.toMatch(/demo-data|demoProducts|demoCategories|demoBrands/);
    }
    const detailRoute = routes[1]!;
    expect(detailRoute).toContain('satisfies GetStaticPaths');
    expect(detailRoute).toContain('InferGetStaticParamsType');
    expect(detailRoute).toContain('InferGetStaticPropsType');
    expect(detailRoute).toContain('params: { locale, slug: brand.slug }');
    expect(detailRoute).toContain('buildBrandRouteMaps(englishBrands, vietnameseBrands)');
  });

  test('centralizes locale copy and preserves accessible detail structure', () => {
    const detail = source('src/components/brands/BrandDetail.astro');
    const routeSources = [
      source('src/pages/[locale]/brands/index.astro'),
      source('src/pages/[locale]/brands/[slug].astro'),
    ].join('\n');

    expect(detail).not.toMatch(/demoNotice|brand-detail__notice/);
    expect(detail).toContain('headingLevel="h3"');
    expect(detail).toContain('<h1>{brand.name}</h1>');
    expect(detail).toContain('accentClasses[brand.accent]');
    expect(detail).not.toMatch(/style=\{`[^`]*brand\.accent|--brand-accent:\s*\$\{/);
    expect(routeSources.match(/headingLevel="h2"/g)).toHaveLength(1);
    expect(routeSources).not.toMatch(/locale\s*===|locale\s*\?/);
  });
});
