import { describe, expect, test } from 'bun:test';
import {
  CACHE_CONTROL,
  isCacheEligibleRequest,
  isCacheableResponse,
  withRuntimeCache,
} from '../src/lib/runtime/cache';

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

const request = (path: string, init?: RequestInit) =>
  new Request(`https://paradisefinefoods.com${path}`, init);

describe('cache eligibility', () => {
  test('accepts anonymous GET and HEAD pages plus GET server islands', () => {
    expect(isCacheEligibleRequest(request('/en/products/'))).toBe(true);
    expect(isCacheEligibleRequest(request('/vi/blogs/story/', { method: 'HEAD' }))).toBe(true);
    expect(isCacheEligibleRequest(request('/_server-islands/related?s=x&e=y&p=z'))).toBe(true);
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
});

describe('runtime cache behavior', () => {
  test('returns a cached response without rendering', async () => {
    const cache = new MemoryCache();
    cache.response = new Response('<main>Cached</main>', {
      headers: { 'Content-Type': 'text/html' },
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
    expect(renderCount).toBe(0);
    expect(cache.matches).toHaveLength(1);
  });

  test('stores successful HTML with the one-hour TTL and stale policy', async () => {
    const cache = new MemoryCache();

    const response = await withRuntimeCache(
      request('/en/products/'),
      async () => new Response('<main>Products</main>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
      cache,
    );

    expect(response.headers.get('Cache-Control')).toBe(CACHE_CONTROL);
    expect(CACHE_CONTROL).toContain('s-maxage=3600');
    expect(CACHE_CONTROL).toContain('stale-while-revalidate=86400');
    expect(cache.puts).toHaveLength(1);
    expect(cache.puts[0]?.request.method).toBe('GET');
    expect(cache.puts[0]?.response.headers.get('Cache-Control')).toBe(CACHE_CONTROL);
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
});
