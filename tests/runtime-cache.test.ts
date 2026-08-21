import { describe, expect, test } from 'bun:test';
import {
  isCacheEligibleRequest,
  isCacheableResponse,
  withRuntimeCache,
} from '../src/lib/runtime/cache';
import type { SitemapQueries } from '../src/pages/sitemap.xml';
import { createSitemapResponse } from '../src/pages/sitemap.xml';
import { getBlogPosts, getBrands, getProducts, getRecipes } from './fixtures/directus';

class MemoryCache {
  readonly matches: Request[] = [];
  readonly puts: Array<{ request: Request; response: Response }> = [];
  response: Response | undefined;

  async match(request: Request) {
    this.matches.push(request);
    return this.response?.clone();
  }

  async put(request: Request, response: Response) {
    this.puts.push({ request, response: response.clone() });
  }
}

class PersistingMemoryCache {
  readonly matches: Request[] = [];
  readonly puts: Array<{ request: Request; response: Response }> = [];
  readonly responses = new Map<string, Response>();

  async match(request: Request) {
    this.matches.push(request);
    return this.responses.get(request.url)?.clone();
  }

  async put(request: Request, response: Response) {
    const stored = response.clone();
    this.puts.push({ request, response: stored.clone() });
    this.responses.set(request.url, stored);
  }
}

const request = (path: string, init?: RequestInit) =>
  new Request(`https://paradisefinefoods.com${path}`, init);

describe('cache eligibility', () => {
  test('accepts anonymous GET and HEAD pages, server islands, and the exact sitemap path', () => {
    expect(isCacheEligibleRequest(request('/en/products/'))).toBe(true);
    expect(isCacheEligibleRequest(request('/vi/blogs/story/', { method: 'HEAD' }))).toBe(true);
    expect(isCacheEligibleRequest(request('/_server-islands/related?s=x&e=y&p=z'))).toBe(true);
    expect(isCacheEligibleRequest(request('/sitemap.xml'))).toBe(true);
    expect(isCacheEligibleRequest(request('/sitemap.xml', { method: 'HEAD' }))).toBe(true);
    expect(isCacheEligibleRequest(request('/sitemap-index.xml'))).toBe(false);
    expect(isCacheEligibleRequest(request('/feed.xml'))).toBe(false);
  });

  test('bypasses APIs, authorization, cookies, previews, assets, and non-idempotent methods', () => {
    expect(isCacheEligibleRequest(request('/api/revalidate'))).toBe(false);
    expect(isCacheEligibleRequest(request('/en/contact/', {
      headers: { Authorization: 'Bearer token' },
    }))).toBe(false);
    expect(isCacheEligibleRequest(request('/en/contact/', {
      headers: { Cookie: 'session=abc' },
    }))).toBe(false);
    expect(isCacheEligibleRequest(request('/en/blogs/story/?preview=1'))).toBe(false);
    expect(isCacheEligibleRequest(request('/_astro/site.css'))).toBe(false);
    expect(isCacheEligibleRequest(request('/_image'))).toBe(false);
    expect(isCacheEligibleRequest(request('/en/contact/', { method: 'POST' }))).toBe(false);
    expect(isCacheEligibleRequest(request('/_server-islands/related', { method: 'POST' }))).toBe(false);
  });

  test('accepts only successful HTML responses without cookies', () => {
    const eligibleRequest = request('/en/');

    expect(isCacheableResponse(
      eligibleRequest,
      new Response('<main>Home</main>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    )).toBe(true);
    expect(isCacheableResponse(
      eligibleRequest,
      new Response('unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }),
    )).toBe(false);
    expect(isCacheableResponse(
      eligibleRequest,
      new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )).toBe(false);
    expect(isCacheableResponse(
      eligibleRequest,
      new Response('<main>Private</main>', {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': 'session=abc',
        },
      }),
    )).toBe(false);
  });

  test('accepts successful XML only for the exact sitemap path', () => {
    const xml = new Response('<urlset></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });

    expect(isCacheableResponse(request('/sitemap.xml'), xml.clone())).toBe(true);
    expect(isCacheableResponse(request('/sitemap.xml', { method: 'HEAD' }), xml.clone())).toBe(true);
    expect(isCacheableResponse(request('/feed.xml'), xml.clone())).toBe(false);
    expect(isCacheableResponse(request('/en/products/'), xml.clone())).toBe(false);
    expect(isCacheableResponse(
      request('/sitemap.xml'),
      new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } }),
    )).toBe(false);
  });
});

describe('runtime cache behavior', () => {
  test('returns a cached response without rendering', async () => {
    const cache = new MemoryCache();
    cache.response = new Response('<main>Cached</main>', {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
    let renderCount = 0;

    const response = await withRuntimeCache(
      request('/en/'),
      async () => {
        renderCount += 1;
        return new Response('<main>Fresh</main>');
      },
      cache,
    );

    expect(await response.text()).toBe('<main>Cached</main>');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0');
    expect(cache.response.headers.get('Cache-Control'))
      .toBe('public, max-age=3600, stale-while-revalidate=86400');
    expect(renderCount).toBe(0);
    expect(cache.matches).toHaveLength(1);
  });

  test('stores edge policy while returning browser revalidation policy', async () => {
    const cache = new MemoryCache();

    const response = await withRuntimeCache(
      request('/en/products/'),
      async () => new Response('<main>Products</main>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
      cache,
    );

    const browserPolicy = response.headers.get('Cache-Control');
    const storedPolicy = cache.puts[0]?.response.headers.get('Cache-Control');
    expect(browserPolicy).toBe('public, max-age=0');
    expect(response.headers.get('CDN-Cache-Control')).toBeNull();
    expect(cache.puts).toHaveLength(1);
    expect(cache.puts[0]?.request.method).toBe('GET');
    expect(storedPolicy).toContain('max-age=3600');
    expect(storedPolicy).toContain('stale-while-revalidate=86400');
    expect(storedPolicy).not.toContain('s-maxage');
    expect(storedPolicy).not.toContain('must-revalidate');
    expect(storedPolicy).not.toContain('proxy-revalidate');
    expect(cache.puts[0]?.response.headers.get('CDN-Cache-Control')).toBeNull();
    expect(await cache.puts[0]?.response.text()).toBe('<main>Products</main>');
  });

  test('does not look up or store bypassed requests', async () => {
    const cache = new MemoryCache();
    const privateRequest = request('/en/', {
      headers: { Cookie: 'session=abc' },
    });
    const rendered = new Response('<main>Private</main>', {
      headers: { 'Content-Type': 'text/html' },
    });

    const response = await withRuntimeCache(privateRequest, async () => rendered, cache);

    expect(response).toBe(rendered);
    expect(cache.matches).toEqual([]);
    expect(cache.puts).toEqual([]);
    expect(response.headers.get('Cache-Control')).toBeNull();
  });

  test('does not store a 503 response', async () => {
    const cache = new MemoryCache();

    const response = await withRuntimeCache(
      request('/en/products/'),
      async () => new Response('CMS unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }),
      cache,
    );

    expect(response.status).toBe(503);
    expect(cache.puts).toEqual([]);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  test('stores the runtime sitemap once and serves the next request without new CMS queries', async () => {
    const cache = new PersistingMemoryCache();
    const queryCalls: string[] = [];
    const queries: SitemapQueries = {
      getProducts: async (locale) => {
        queryCalls.push(`products:${locale}`);
        return getProducts(locale);
      },
      getBrands: async (locale) => {
        queryCalls.push(`brands:${locale}`);
        return getBrands(locale);
      },
      getBlogPosts: async (locale) => {
        queryCalls.push(`blogs:${locale}`);
        return getBlogPosts(locale);
      },
      getRecipes: async (locale) => {
        queryCalls.push(`recipes:${locale}`);
        return getRecipes(locale);
      },
    };
    const sitemapRequest = request('/sitemap.xml');
    const render = () => createSitemapResponse('https://paradisefinefoods.com', queries);

    const first = await withRuntimeCache(sitemapRequest, render, cache);
    const firstXml = await first.text();

    expect(queryCalls).toHaveLength(8);
    expect(first.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(first.headers.get('Cache-Control')).toBe('public, max-age=0');
    expect(cache.puts).toHaveLength(1);
    expect(cache.puts[0]?.response.headers.get('Cache-Control'))
      .toBe('public, max-age=3600, stale-while-revalidate=86400');

    const second = await withRuntimeCache(sitemapRequest, render, cache);

    expect(await second.text()).toBe(firstXml);
    expect(second.headers.get('Cache-Control')).toBe('public, max-age=0');
    expect(queryCalls).toHaveLength(8);
    expect(cache.matches).toHaveLength(2);
    expect(cache.puts).toHaveLength(1);
  });

  test('does not store a failed runtime sitemap and forces no-store', async () => {
    const cache = new PersistingMemoryCache();

    const response = await withRuntimeCache(
      request('/sitemap.xml'),
      async () => new Response('Sitemap temporarily unavailable.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }),
      cache,
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(cache.puts).toHaveLength(0);
  });
});
