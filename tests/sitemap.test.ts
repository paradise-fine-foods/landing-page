import { describe, expect, test } from 'bun:test';

import { CmsUnavailableError } from '../src/lib/cms/queries';
import type { BlogPost, Brand } from '../src/lib/cms/types';
import {
  buildSitemapXml,
  createSitemapResponse,
  type SitemapQueries,
  type SitemapRouteGroup,
} from '../src/pages/sitemap.xml';
import { getBlogPosts, getBrands, getProducts } from './fixtures/directus';

const queries = async (): Promise<SitemapQueries> => ({
  getProducts,
  getBrands,
  getBlogPosts,
});

describe('runtime sitemap XML', () => {
  test('queries both locales and emits fixed plus CMS routes with reciprocal alternates', async () => {
    const base = await queries();
    const calls: string[] = [];
    const trackingQueries: SitemapQueries = {
      getProducts: async (locale) => {
        calls.push(`products:${locale}`);
        return base.getProducts(locale);
      },
      getBrands: async (locale) => {
        calls.push(`brands:${locale}`);
        return base.getBrands(locale);
      },
      getBlogPosts: async (locale) => {
        calls.push(`blogs:${locale}`);
        return base.getBlogPosts(locale);
      },
    };

    const response = await createSitemapResponse(
      new URL('https://paradisefinefoods.com'),
      trackingQueries,
    );
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=3600, stale-while-revalidate=86400',
    );
    expect(calls.sort()).toEqual([
      'blogs:en', 'blogs:vi',
      'brands:en', 'brands:vi',
      'products:en', 'products:vi',
    ]);
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<loc>https://paradisefinefoods.com/en/</loc>');
    expect(xml).toContain('<loc>https://paradisefinefoods.com/vi/contact/supplier/</loc>');

    const [englishProducts, vietnameseProducts, englishBrands, vietnameseBrands, englishPosts, vietnamesePosts] = await Promise.all([
      base.getProducts('en'),
      base.getProducts('vi'),
      base.getBrands('en'),
      base.getBrands('vi'),
      base.getBlogPosts('en'),
      base.getBlogPosts('vi'),
    ]);
    const [englishProduct] = englishProducts;
    const [vietnameseProduct] = vietnameseProducts;
    expect(xml).toContain(`<loc>https://paradisefinefoods.com/en/products/${englishProduct!.slug}/</loc>`);
    expect(xml).toContain(`hreflang="vi" href="https://paradisefinefoods.com/vi/products/${vietnameseProduct!.slug}/"`);
    expect(xml).toContain(`<loc>https://paradisefinefoods.com/en/brands/${englishBrands[0]!.slug}/</loc>`);
    expect(xml).toContain(`<loc>https://paradisefinefoods.com/vi/blogs/${vietnamesePosts[0]!.slug}/</loc>`);

    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locations).toHaveLength(
      14
      + englishProducts.length + vietnameseProducts.length
      + englishBrands.length + vietnameseBrands.length
      + englishPosts.length + vietnamesePosts.length,
    );
    expect(new Set(locations).size).toBe(locations.length);
  });

  test('escapes XML text and attributes without double-escaping absolute URLs', () => {
    const routes: SitemapRouteGroup[] = [{
      en: '/en/products/fish-&-chips/',
      vi: '/vi/products/ca-<chien>/',
    }];
    const xml = buildSitemapXml('https://example.com/?catalog="fine"&owner=paradise', routes);

    expect(xml).toContain('https://example.com/en/products/fish-&amp;-chips/');
    expect(xml).toContain('https://example.com/vi/products/ca-%3Cchien%3E/');
    expect(xml).not.toContain('fish-&-chips');
    expect(xml).not.toContain('&amp;amp;');
  });

  test('returns a no-store 503 for known CMS failures without exposing the error', async () => {
    const unavailable: SitemapQueries = {
      getProducts: async () => { throw new CmsUnavailableError(); },
      getBrands: async () => [] as Brand[],
      getBlogPosts: async () => [] as BlogPost[],
    };

    const response = await createSitemapResponse('https://paradisefinefoods.com', unavailable);
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(body).toBe('Sitemap temporarily unavailable.');
    expect(body).not.toContain('CMS');
  });

  test('rethrows programming failures instead of disguising them as CMS downtime', async () => {
    const broken: SitemapQueries = {
      getProducts: async () => { throw new TypeError('broken mapper'); },
      getBrands: async () => [] as Brand[],
      getBlogPosts: async () => [] as BlogPost[],
    };

    expect(createSitemapResponse('https://paradisefinefoods.com', broken))
      .rejects.toThrow('broken mapper');
  });
});
