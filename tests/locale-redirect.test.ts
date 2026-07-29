import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  localizedRedirectLocation,
  preferredLocale,
  shouldRedirectToLocale,
} from '../src/lib/i18n/request-locale';
import { onRequest } from '../src/middleware';

const read = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('preferredLocale', () => {
  test('selects supported regional languages by quality weight', () => {
    expect(preferredLocale('en-US;q=0.7, vi-VN;q=0.9, vi;q=0.8')).toBe('vi');
    expect(preferredLocale('vi-VN;q=0.6, en-GB;q=0.8')).toBe('en');
  });

  test('ignores disabled and unsupported languages', () => {
    expect(preferredLocale('vi;q=0, fr-FR;q=1, en;q=0.5')).toBe('en');
    expect(preferredLocale('fr-FR, de;q=0.8')).toBe('en');
  });

  test('falls back to English without a usable header', () => {
    expect(preferredLocale(null)).toBe('en');
    expect(preferredLocale('')).toBe('en');
    expect(preferredLocale('*')).toBe('en');
  });
});

describe('locale redirect decisions', () => {
  const request = (pathname: string, init?: RequestInit) =>
    new Request(`https://paradisefinefoods.com${pathname}`, init);

  test('redirects unprefixed extensionless page requests', () => {
    expect(shouldRedirectToLocale(request('/'))).toBe(true);
    expect(shouldRedirectToLocale(request('/contact/'))).toBe(true);
    expect(shouldRedirectToLocale(request('/products/cream-cheese/'))).toBe(true);
    expect(shouldRedirectToLocale(request('/contact/', { method: 'HEAD' }))).toBe(true);
  });

  test('bypasses localized, internal, API, file, and mutating requests', () => {
    for (const pathname of [
      '/en/',
      '/vi/contact/',
      '/fr/',
      '/_astro/site.css',
      '/_image',
      '/api/enquiry',
      '/404',
      '/503',
      '/503/',
      '/favicon.svg',
      '/sitemap-index.xml',
    ]) {
      expect(shouldRedirectToLocale(request(pathname))).toBe(false);
    }
    expect(shouldRedirectToLocale(request('/contact/', { method: 'POST' }))).toBe(false);
  });

  test('prefixes the locale while preserving path, slash, and query', () => {
    expect(localizedRedirectLocation(new URL('https://paradisefinefoods.com/'), 'en')).toBe('/en/');
    expect(localizedRedirectLocation(new URL('https://paradisefinefoods.com/contact/?source=hero'), 'vi')).toBe('/vi/contact/?source=hero');
    expect(localizedRedirectLocation(new URL('https://paradisefinefoods.com/contact'), 'en')).toBe('/en/contact');
  });
});

describe('Astro locale middleware', () => {
  test('returns the complete locale redirect response without rendering', async () => {
    let rendered = false;
    const request = new Request('https://paradisefinefoods.com/contact/?source=hero', {
      headers: { 'Accept-Language': 'vi-VN, en;q=0.8' },
    });
    const response = await onRequest(
      { request } as never,
      async () => {
        rendered = true;
        return new Response('rendered');
      },
    ) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/vi/contact/?source=hero');
    expect(response.headers.get('Vary')).toBe('Accept-Language');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(rendered).toBe(false);
  });

  test.each([
    ['localized', '/en/contact/', 'GET'],
    ['asset', '/_astro/site.css', 'GET'],
    ['API', '/api/enquiry', 'GET'],
    ['service-unavailable rewrite', '/503', 'GET'],
    ['service-unavailable rewrite with slash', '/503/', 'GET'],
    ['file', '/favicon.svg', 'GET'],
    ['mutating', '/contact/', 'POST'],
  ])('delegates %s requests exactly to Astro rendering', async (_kind, pathname, method) => {
    let renderCount = 0;
    const renderedResponse = new Response('rendered', { status: 207 });
    const request = new Request(`https://paradisefinefoods.com${pathname}`, { method });
    const response = await onRequest(
      { request } as never,
      async () => {
        renderCount += 1;
        return renderedResponse;
      },
    ) as Response;

    expect(response).toBe(renderedResponse);
    expect(response.status).toBe(207);
    expect(renderCount).toBe(1);
  });
});

test('imports the canonical default locale', async () => {
  const localeSource = await read('../src/lib/i18n/request-locale.ts');

  expect(localeSource).toContain("import { defaultLocale, isLocale, type Locale } from './types';");
  expect(localeSource).not.toMatch(/const defaultLocale[^=]*=\s*['"]en['"]/);
});

test('uses the Astro Cloudflare adapter for server output', async () => {
  const packageJson = JSON.parse(await read('../package.json')) as {
    dependencies?: Record<string, string>;
  };
  const lockfile = await read('../bun.lock');
  const astroConfig = await read('../astro.config.mjs');

  expect(packageJson.dependencies).toHaveProperty('@astrojs/cloudflare');
  expect(lockfile).toContain('"@astrojs/cloudflare"');
  expect(packageJson.dependencies).toHaveProperty('wrangler');
  expect(astroConfig).toContain("from '@astrojs/cloudflare'");
  expect(astroConfig).toContain("adapter: cloudflare({ imageService: 'passthrough' })");
  expect(astroConfig).toContain("output: 'server'");
});

test('uses manual Astro i18n routing so the custom middleware preserves unprefixed error rewrites', async () => {
  const astroConfig = await read('../astro.config.mjs');

  expect(astroConfig).toContain("routing: 'manual'");
  expect(astroConfig).not.toContain('prefixDefaultLocale');
  expect(astroConfig).not.toContain('redirectToDefaultLocale');
});

test('deploys the adapter-generated Worker and removes the custom Worker', async () => {
  const wrangler = await read('../wrangler.jsonc');

  expect(wrangler).toContain('"main": "@astrojs/cloudflare/entrypoints/server"');
  expect(wrangler).toMatch(/"directory"\s*:\s*"\.\/dist"/);
  expect(wrangler).not.toContain('"run_worker_first"');

  expect(existsSync(new URL('../src/worker.ts', import.meta.url))).toBe(false);
});

test('keeps Wrangler generated state out of project configuration', async () => {
  const gitignore = await read('../.gitignore');

  expect(gitignore).toMatch(/^\.wrangler\/$/m);
});
