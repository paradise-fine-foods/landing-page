import type { APIRoute } from 'astro';

import {
  getBlogPosts,
  getBrands,
  getProducts,
  type CmsQueries,
} from '../lib/cms/queries';
import { loadCmsPageData } from '../lib/cms/page-state';
import type { BlogPost, Brand, Product } from '../lib/cms/types';
import { blogDetailPath } from '../lib/blogs/routes';
import { brandDetailPath } from '../lib/brands/routes';
import { productDetailPath } from '../lib/catalog/routes';
import { localizedPath } from '../lib/i18n/routes';
import { locales, type Locale, type RouteKey } from '../lib/i18n/types';
import { EDGE_CACHE_CONTROL } from '../lib/runtime/cache';

export type SitemapQueries = Pick<CmsQueries, 'getProducts' | 'getBrands' | 'getBlogPosts'>;
export type SitemapRouteGroup = Partial<Record<Locale, string>>;

const productionQueries: SitemapQueries = { getProducts, getBrands, getBlogPosts };
const fixedRouteKeys: readonly RouteKey[] = [
  'home',
  'products',
  'brands',
  'blogs',
  'contact',
  'customerContact',
  'supplierContact',
];

const fixedRouteGroups = (): SitemapRouteGroup[] => fixedRouteKeys.map((route) => ({
  en: localizedPath('en', route),
  vi: localizedPath('vi', route),
}));

const localizedRecordGroups = <T extends { id: string; slug: string }>(
  english: readonly T[],
  vietnamese: readonly T[],
  path: (locale: Locale, record: T) => string,
): SitemapRouteGroup[] => {
  const englishById = new Map(english.map((record) => [record.id, record]));
  const vietnameseById = new Map(vietnamese.map((record) => [record.id, record]));
  const ids = new Set([...englishById.keys(), ...vietnameseById.keys()]);

  return [...ids].map((id) => ({
    ...(englishById.get(id) ? { en: path('en', englishById.get(id)!) } : {}),
    ...(vietnameseById.get(id) ? { vi: path('vi', vietnameseById.get(id)!) } : {}),
  }));
};

const escapeXml = (value: string): string => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
})[character]!);

const absoluteUrl = (site: string | URL, pathname: string): string =>
  new URL(pathname, site).toString();

export const buildSitemapXml = (
  site: string | URL,
  routeGroups: readonly SitemapRouteGroup[],
): string => {
  const seen = new Set<string>();
  const entries: string[] = [];

  for (const group of routeGroups) {
    const alternates = locales.flatMap((locale) => group[locale]
      ? [{ locale, href: absoluteUrl(site, group[locale]!) }]
      : []);

    for (const locale of locales) {
      const pathname = group[locale];
      if (!pathname) continue;
      const location = absoluteUrl(site, pathname);
      if (seen.has(location)) continue;
      seen.add(location);

      entries.push([
        '  <url>',
        `    <loc>${escapeXml(location)}</loc>`,
        ...alternates.map(({ locale: alternateLocale, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${escapeXml(href)}" />`),
        '  </url>',
      ].join('\n'));
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
};

export const createSitemapResponse = async (
  site: string | URL,
  queries: SitemapQueries = productionQueries,
): Promise<Response> => {
  const pageData = await loadCmsPageData(
    () => queries.getProducts('en'),
    () => queries.getProducts('vi'),
    () => queries.getBrands('en'),
    () => queries.getBrands('vi'),
    () => queries.getBlogPosts('en'),
    () => queries.getBlogPosts('vi'),
  );

  if (!pageData.ok) {
    return new Response('Sitemap temporarily unavailable.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const [englishProducts, vietnameseProducts, englishBrands, vietnameseBrands, englishPosts, vietnamesePosts] = pageData.data;
  const routes: SitemapRouteGroup[] = [
    ...fixedRouteGroups(),
    ...localizedRecordGroups<Product>(englishProducts, vietnameseProducts, productDetailPath),
    ...localizedRecordGroups<Brand>(englishBrands, vietnameseBrands, brandDetailPath),
    ...localizedRecordGroups<BlogPost>(englishPosts, vietnamesePosts, blogDetailPath),
  ];

  return new Response(buildSitemapXml(site, routes), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': EDGE_CACHE_CONTROL,
    },
  });
};

export const GET: APIRoute = ({ site }) =>
  createSitemapResponse(site ?? 'https://paradisefinefoods.com');
