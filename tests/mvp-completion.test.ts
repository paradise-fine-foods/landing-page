import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  demoBrands,
  demoCategories,
  demoFeaturedContent,
  demoGlobalSettings,
  demoProducts,
} from '../src/lib/cms/demo-data';
import { ui } from '../src/lib/i18n/ui';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

const filesBelow = (directory: string): string[] => readdirSync(join(root, directory), { withFileTypes: true })
  .flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesBelow(path) : [path];
  });

const stringsBelow = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsBelow);
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringsBelow);
  return [];
};

interface UiLeaf {
  path: string;
  value: string;
}

const uiLeavesBelow = (value: unknown, path: string): UiLeaf[] => {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => uiLeavesBelow(item, `${path}.${index}`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => uiLeavesBelow(item, `${path}.${key}`));
  }
  return [];
};

const uiOwnershipRows = (ledger: string) => {
  const manifest = ledger.match(/<!-- ui-ownership:start -->([\s\S]*?)<!-- ui-ownership:end -->/)?.[1] ?? '';
  return manifest.split('\n').flatMap((line) => {
    const match = line.match(/^\|\s*`(ui\.[^`]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/);
    return match ? [{ pattern: match[1], owner: match[2], input: match[3], acceptance: match[4] }] : [];
  });
};

const matchesUiFamily = (path: string, pattern: string): boolean => {
  const patternSegments = pattern.split('.');
  const pathSegments = path.split('.');
  return patternSegments.length === pathSegments.length
    && patternSegments.every((segment, index) => segment === '*' || segment === pathSegments[index]);
};

const runtimeUrlSources = [
  'astro.config.mjs',
  'src/lib/cms/demo-data.ts',
  'src/layouts/SiteLayout.astro',
  'src/pages/404.astro',
  'src/pages/en/index.astro',
  'src/pages/vi/index.astro',
  'src/components/sections/CategoryDiscovery.astro',
  'src/components/catalog/ProductDetail.astro',
] as const;

const discoverTemporaryUrls = (): string[] => {
  const discovered = new Set<string>();
  for (const path of runtimeUrlSources) {
    const content = source(path).replace(/^\s*\/\/.*$/gm, '');
    for (const [url] of content.matchAll(/(?:https?:\/\/|mailto:|tel:)[^\s"'`<>]+/g)) discovered.add(url);
    for (const [, parameter] of content.matchAll(/\?(category|product)=\$\{[^}\r\n]+\}/g)) {
      discovered.add(`?${parameter}={value}`);
    }
    for (const [, parameter, value] of content.matchAll(/\?(category|interest|product)=([a-z0-9-]+)/g)) {
      discovered.add(`?${parameter}=${value}`);
    }
  }
  return [...discovered].sort();
};

const discoveredMedia = [
  ...filesBelow('src/assets/demo'),
  ...readdirSync(join(root, 'public'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(?:demo|favicon)/i.test(entry.name))
    .map((entry) => `public/${entry.name}`),
];

describe('client-review MVP completion contracts', () => {
  test('ships a self-contained bilingual 404 with direct locale choices', () => {
    const path = join(root, 'src/pages/404.astro');
    expect(existsSync(path)).toBe(true);
    const page = source('src/pages/404.astro');

    expect(page).toContain('<html lang="en">');
    expect(page).toContain('<main');
    expect(page).toContain('<h1');
    expect(page).toContain('Không tìm thấy trang này');
    expect(page).toContain('This page could not be found');
    for (const href of ['/en/', '/en/products/', '/vi/', '/vi/products/']) {
      expect(page).toContain(`href="${href}"`);
    }
    expect(page).not.toMatch(/Astro\.redirect|navigator\.language|<script/);
    expect(page).toContain('<title>Page not found | Paradise Fine Foods Demo</title>');
    expect(page).not.toMatch(/<title>[^<]*[À-ỹĐđ]/u);
    for (const phrase of ['Chuyển đến nội dung', 'Bản duyệt khách hàng', 'Nội dung hư cấu chỉ dùng để duyệt']) {
      expect(page).toContain(`<span lang="vi">${phrase}</span>`);
    }
    expect(page).toContain('.not-found__link');
    expect(page.match(/class="[^"]*not-found__link/g)).toHaveLength(5);
    expect(page).toContain('min-block-size: 2.75rem');
  });

  test('maintains a comprehensive production replacement ledger', () => {
    const path = join(root, 'docs/demo-content.md');
    expect(existsSync(path)).toBe(true);
    const ledger = source('docs/demo-content.md');

    expect(discoveredMedia.filter((item) => !ledger.includes(`\`${item}\``))).toEqual([]);
    for (const id of [...demoProducts, ...demoBrands, ...demoCategories].map(({ id }) => id)) {
      expect(ledger).toContain(`\`${id}\``);
    }
    const authoritativeFixtureValues = stringsBelow({
      categories: demoCategories.map(({ id, slug, name, description }) => ({ id, slug, name, description })),
      brands: demoBrands.map(({ id, slug, name, description, origin, accent }) => ({ id, slug, name, description, origin, accent })),
      products: demoProducts.map(({ id, slug, name, description, brandId, categoryIds, origin, applications, audienceChannels, packFormat, storage, benefits }) => ({ id, slug, name, description, brandId, categoryIds, origin, applications, audienceChannels, packFormat, storage, benefits })),
      global: demoGlobalSettings,
      featured: {
        hero: {
          eyebrow: demoFeaturedContent.hero.eyebrow,
          title: demoFeaturedContent.hero.title,
          body: demoFeaturedContent.hero.body,
          productId: demoFeaturedContent.hero.productId,
          alt: demoFeaturedContent.hero.image.alt,
        },
        editorial: {
          title: demoFeaturedContent.editorial.title,
          body: demoFeaturedContent.editorial.body,
          alt: demoFeaturedContent.editorial.image.alt,
        },
      },
    });
    expect([...new Set(authoritativeFixtureValues)].filter((value) => !ledger.includes(value))).toEqual([]);
    const uiLeaves = uiLeavesBelow(ui, 'ui');
    const ownershipRows = uiOwnershipRows(ledger);
    expect(uiLeaves.length).toBeGreaterThan(290);
    expect(uiLeaves.filter(({ value }) => value.length === 0)).toEqual([]);
    expect(ownershipRows.length).toBeGreaterThan(0);
    expect(ownershipRows.filter(({ owner, input, acceptance }) => !owner || !input || !acceptance)).toEqual([]);
    expect(uiLeaves.flatMap(({ path }) => {
      const matches = ownershipRows.filter(({ pattern }) => matchesUiFamily(path, pattern));
      return matches.length === 1 ? [] : [{ path, matches: matches.map(({ pattern }) => pattern) }];
    })).toEqual([]);
    expect(ownershipRows.filter(({ pattern }) => !uiLeaves.some(({ path }) => matchesUiFamily(path, pattern)))).toEqual([]);

    expect(runtimeUrlSources.filter((file) => !ledger.includes(`\`${file}\``))).toEqual([]);
    expect(discoverTemporaryUrls().filter((url) => !ledger.includes(`\`${url}\``))).toEqual([]);
    expect(ledger).toContain('`src/lib/enquiry/submit.ts`');
    for (const responsibility of ['Production owner', 'Source/input', 'Acceptance']) {
      expect(ledger).toContain(responsibility);
    }
    expect(ledger).toMatch(/no business claims (?:in this MVP )?are verified/i);
    expect(ledger).toMatch(/does not (?:send|deliver).*(?:email|CRM)/i);
  });

  test('keeps the browser checklist on the generated Vietnamese brand route', () => {
    const plan = source('docs/superpowers/plans/2026-07-16-finefoods-client-review-mvp.md');
    expect(plan).toContain('/vi/brands/nha-sua-maison/');
    expect(plan).not.toContain('/vi/brands/nha-sua-mau/');
  });

  test('wires a generated-output verifier into every production build', () => {
    const packageJson = source('package.json');
    expect(packageJson).toContain('tests/verify-built-mvp.ts');
    expect(existsSync(join(root, 'tests/verify-built-mvp.ts'))).toBe(true);
  });
});
