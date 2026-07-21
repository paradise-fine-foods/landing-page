/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ui } from '../src/lib/i18n/ui';
import { counterpartPath, localizedPath } from '../src/lib/i18n/routes';
import { counterpartLocale, getLocaleStaticPaths } from '../src/lib/i18n/static-paths';
import { buildMeta } from '../src/lib/seo/meta';

describe('localized routes', () => {
  test('prefixes every route including English', () => {
    expect(localizedPath('en', 'products')).toBe('/en/products/');
    expect(localizedPath('vi', 'products')).toBe('/vi/products/');
    expect(localizedPath('en', 'brands')).toBe('/en/brands/');
    expect(localizedPath('vi', 'brands')).toBe('/vi/brands/');
    expect(localizedPath('en', 'blogs')).toBe('/en/blogs/');
    expect(localizedPath('vi', 'blogs')).toBe('/vi/blogs/');
    expect(localizedPath('vi', 'contact')).toBe('/vi/contact/');
  });

  test('preserves translated product counterparts', () => {
    const maps = [{ en: '/en/products/demo-butter/', vi: '/vi/products/bo-mau/' }];
    expect(counterpartPath('/en/products/demo-butter/', 'vi', maps)).toBe('/vi/products/bo-mau/');
  });

  test('falls back to the target locale home', () => {
    expect(counterpartPath('/en/unknown/', 'vi', [])).toBe('/vi/');
  });
});

test('removes every legacy Vietnamese route', () => {
  const config = readFileSync(join(import.meta.dir, '..', 'astro.config.mjs'), 'utf8');
  const legacyRoutes = ['/vi/san-pham', '/vi/thuong-hieu', '/vi/lien-he'];

  for (const legacyRoute of legacyRoutes) expect(config).not.toContain(legacyRoute);
  for (const page of ['san-pham/[slug].astro', 'thuong-hieu/[slug].astro']) {
    expect(existsSync(join(import.meta.dir, '..', 'src', 'pages', '[locale]', page))).toBe(false);
  }
});

test('provides string-valued static paths with matching locale props', () => {
  expect(getLocaleStaticPaths()).toEqual([
    { params: { locale: 'en' }, props: { locale: 'en' } },
    { params: { locale: 'vi' }, props: { locale: 'vi' } },
  ]);
});

test('maps each locale to its reciprocal counterpart', () => {
  expect(counterpartLocale('en')).toBe('vi');
  expect(counterpartLocale('vi')).toBe('en');
});

test('consolidates every localized page shape under one static locale tree', () => {
  const localizedPages = [
    'index.astro',
    'products/index.astro',
    'products/[slug].astro',
    'brands/index.astro',
    'brands/[slug].astro',
    'blogs/index.astro',
    'blogs/[slug].astro',
    'contact.astro',
    'contact/[mode].astro',
  ];

  for (const page of localizedPages) {
    const path = join(import.meta.dir, '..', 'src', 'pages', '[locale]', page);
    expect(existsSync(path)).toBe(true);
    if (existsSync(path)) expect(readFileSync(path, 'utf8')).toContain('getStaticPaths');
    expect(existsSync(join(import.meta.dir, '..', 'src', 'pages', 'en', page))).toBe(false);
    expect(existsSync(join(import.meta.dir, '..', 'src', 'pages', 'vi', page))).toBe(false);
  }
});

test('infers trusted locale props on every locale-only static page', () => {
  for (const page of [
    'index.astro',
    'products/index.astro',
    'brands/index.astro',
    'blogs/index.astro',
    'contact.astro',
  ]) {
    const path = join(import.meta.dir, '..', 'src', 'pages', '[locale]', page);
    const route = readFileSync(path, 'utf8');
    expect(route).toContain("import type { InferGetStaticPropsType } from 'astro'");
    expect(route).toContain('type Props = InferGetStaticPropsType<typeof getStaticPaths>');
    expect(route).toContain('Astro.props as Props');
  }
});

test('imports canonical locale configuration values', () => {
  const config = readFileSync(join(import.meta.dir, '..', 'astro.config.mjs'), 'utf8');

  expect(config).toContain("import { defaultLocale, locales } from './src/lib/i18n/types.ts';");
  expect(config).toContain('defaultLocale,');
  expect(config).toContain('locales: [...locales],');
  expect(config).not.toMatch(/defaultLocale:\s*'en'/);
  expect(config).not.toMatch(/locales:\s*\['en',\s*'vi'\]/);
});

test('catalog includes distinct localized no-JavaScript guidance', () => {
  expect(ui.en.catalog.noScript.length).toBeGreaterThan(0);
  expect(ui.vi.catalog.noScript.length).toBeGreaterThan(0);
  expect(ui.en.catalog.noScript).not.toBe(ui.vi.catalog.noScript);
});

test('buildMeta returns canonical and reciprocal alternates', () => {
  const meta = buildMeta({
    site: 'https://paradisefinefoods.com',
    locale: 'en',
    title: 'Products',
    description: 'Demo catalog',
    pathname: '/en/products/',
    alternatePath: '/vi/products/',
  });
  expect(meta.canonical).toBe('https://paradisefinefoods.com/en/products/');
  expect(meta.alternates).toEqual([
    { locale: 'en', href: 'https://paradisefinefoods.com/en/products/' },
    { locale: 'vi', href: 'https://paradisefinefoods.com/vi/products/' },
  ]);
});
