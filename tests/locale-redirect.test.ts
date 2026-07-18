import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import {
  localizedRedirectLocation,
  preferredLocale,
  shouldRedirectToLocale,
} from '../src/lib/i18n/request-locale';
import worker from '../src/worker';

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
      '/_astro/site.css',
      '/_image',
      '/api/enquiry',
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

describe('static-assets Worker', () => {
  test('returns the complete locale redirect response without calling assets', async () => {
    const delegated: Request[] = [];
    const request = new Request('https://paradisefinefoods.com/contact/?source=hero', {
      headers: { 'Accept-Language': 'vi-VN, en;q=0.8' },
    });
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async (assetRequest) => {
          delegated.push(assetRequest);
          return new Response('asset');
        },
      },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/vi/contact/?source=hero');
    expect(response.headers.get('Vary')).toBe('Accept-Language');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(delegated).toEqual([]);
  });

  test.each([
    ['localized', '/en/contact/', 'GET'],
    ['asset', '/_astro/site.css', 'GET'],
    ['API', '/api/enquiry', 'GET'],
    ['file', '/favicon.svg', 'GET'],
    ['mutating', '/contact/', 'POST'],
  ])('delegates %s requests exactly to the asset binding', async (_kind, pathname, method) => {
    const delegated: Request[] = [];
    const assetResponse = new Response('asset', { status: 207 });
    const request = new Request(`https://paradisefinefoods.com${pathname}`, { method });
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async (assetRequest) => {
          delegated.push(assetRequest);
          return assetResponse;
        },
      },
    });

    expect(response).toBe(assetResponse);
    expect(response.status).toBe(207);
    expect(delegated).toEqual([request]);
  });
});

test('imports the canonical default locale', async () => {
  const localeSource = await read('../src/lib/i18n/request-locale.ts');

  expect(localeSource).toContain("import { defaultLocale, isLocale, type Locale } from './types';");
  expect(localeSource).not.toMatch(/const defaultLocale[^=]*=\s*['"]en['"]/);
});

test('depends on Wrangler without the unused Astro Cloudflare adapter', async () => {
  const packageJson = JSON.parse(await read('../package.json')) as {
    dependencies?: Record<string, string>;
  };
  const lockfile = await read('../bun.lock');

  expect(packageJson.dependencies).not.toHaveProperty('@astrojs/cloudflare');
  expect(lockfile).not.toContain('"@astrojs/cloudflare"');
  expect(packageJson.dependencies).toHaveProperty('wrangler');
});

test('uses a static-assets Worker before static output handling', async () => {
  const wrangler = await read('../wrangler.jsonc');
  const astroConfig = await read('../astro.config.mjs');

  expect(wrangler).toContain('"main": "./src/worker.ts"');
  expect(wrangler).toMatch(/"directory"\s*:\s*"\.\/dist"/);
  expect(wrangler).toMatch(/"run_worker_first"\s*:\s*true/);
  expect(astroConfig).not.toContain("from '@astrojs/cloudflare'");
  expect(astroConfig).not.toContain('adapter: cloudflare');
});

test('binds the Worker and generated-output verifiers to Astro static output', async () => {
  const wrangler = await read('../wrangler.jsonc');
  const verifierPaths = [
    '../tests/verify-built-cms-assets.ts',
    '../tests/verify-built-living-design.ts',
    '../tests/verify-built-catalog.ts',
    '../tests/verify-built-brands.ts',
    '../tests/verify-built-enquiry.ts',
    '../tests/verify-built-mvp.ts',
    '../tests/verify-built-route-manifest.ts',
  ];

  expect(wrangler).toMatch(/"directory"\s*:\s*"\.\/dist"/);
  for (const verifierPath of verifierPaths) {
    expect(await read(verifierPath)).not.toContain('dist/client');
  }
});

test('keeps Wrangler generated state out of project configuration', async () => {
  const gitignore = await read('../.gitignore');

  expect(gitignore).toMatch(/^\.wrangler\/$/m);
});
