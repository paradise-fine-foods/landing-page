/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import { ui } from '../src/lib/i18n/ui';
import { counterpartPath, localizedPath } from '../src/lib/i18n/routes';
import { buildMeta } from '../src/lib/seo/meta';

describe('localized routes', () => {
  test('prefixes every route including English', () => {
    expect(localizedPath('en', 'products')).toBe('/en/products/');
    expect(localizedPath('vi', 'products')).toBe('/vi/san-pham/');
  });

  test('preserves translated product counterparts', () => {
    const maps = [{ en: '/en/products/demo-butter/', vi: '/vi/san-pham/bo-mau/' }];
    expect(counterpartPath('/en/products/demo-butter/', 'vi', maps)).toBe('/vi/san-pham/bo-mau/');
  });

  test('falls back to the target locale home', () => {
    expect(counterpartPath('/en/unknown/', 'vi', [])).toBe('/vi/');
  });
});

test('catalog includes distinct localized no-JavaScript guidance', () => {
  expect(ui.en.catalog.noScript.length).toBeGreaterThan(0);
  expect(ui.vi.catalog.noScript.length).toBeGreaterThan(0);
  expect(ui.en.catalog.noScript).not.toBe(ui.vi.catalog.noScript);
});

test('buildMeta returns canonical and reciprocal alternates', () => {
  const meta = buildMeta({
    site: 'https://demo.paradisefinefoods.com',
    locale: 'en',
    title: 'Products',
    description: 'Demo catalog',
    pathname: '/en/products/',
    alternatePath: '/vi/san-pham/',
  });
  expect(meta.canonical).toBe('https://demo.paradisefinefoods.com/en/products/');
  expect(meta.alternates).toEqual([
    { locale: 'en', href: 'https://demo.paradisefinefoods.com/en/products/' },
    { locale: 'vi', href: 'https://demo.paradisefinefoods.com/vi/san-pham/' },
  ]);
});
