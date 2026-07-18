import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import {
  localizedRedirectLocation,
  preferredLocale,
  shouldRedirectToLocale,
} from '../src/lib/i18n/request-locale';

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

test('uses a static-assets Worker before static output handling', async () => {
  const worker = await read('../src/worker.ts');
  const wrangler = await read('../wrangler.jsonc');
  const astroConfig = await read('../astro.config.mjs');

  expect(wrangler).toContain('"main": "./src/worker.ts"');
  expect(wrangler).toMatch(/"directory"\s*:\s*"\.\/dist"/);
  expect(wrangler).toMatch(/"run_worker_first"\s*:\s*true/);
  expect(worker).toContain('interface AssetsEnv');
  expect(worker).toContain('ASSETS: {');
  expect(worker).toContain('preferredLocale');
  expect(worker).toContain('shouldRedirectToLocale');
  expect(worker).toContain('localizedRedirectLocation');
  expect(worker).toContain("'Vary': 'Accept-Language'");
  expect(worker).toContain("'Cache-Control': 'no-store'");
  expect(worker).toContain('status: 302');
  expect(worker).toContain('return env.ASSETS.fetch(request)');
  expect(worker).not.toContain('@astrojs/cloudflare/handler');
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
