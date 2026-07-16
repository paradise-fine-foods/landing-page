import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { demoBrands, demoCategories, demoProducts } from '../src/lib/cms/demo-data';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

const stableInventory = {
  products: demoProducts.map(({ id }) => id),
  brands: demoBrands.map(({ id }) => id),
  categories: demoCategories.map(({ id }) => id),
  assets: [
    'src/assets/demo/editorial-table.svg',
    'src/assets/demo/hero-poster-desktop.svg',
    'src/assets/demo/hero-poster-mobile.svg',
    'src/assets/demo/product-stage.svg',
    'public/models/demo-package.glb',
    'public/models/README.md',
  ],
};

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
    for (const href of ['/en/', '/en/products/', '/vi/', '/vi/san-pham/']) {
      expect(page).toContain(`href="${href}"`);
    }
    expect(page).not.toMatch(/Astro\.redirect|navigator\.language|<script/);
  });

  test('maintains a comprehensive production replacement ledger', () => {
    const path = join(root, 'docs/demo-content.md');
    expect(existsSync(path)).toBe(true);
    const ledger = source('docs/demo-content.md');

    for (const group of Object.values(stableInventory)) {
      for (const item of group) expect(ledger).toContain(`\`${item}\``);
    }
    for (const requiredBoundary of [
      'src/lib/cms/demo-data.ts',
      'src/lib/enquiry/submit.ts',
      'https://demo.paradisefinefoods.com',
      '/models/demo-package.glb',
    ]) expect(ledger).toContain(`\`${requiredBoundary}\``);
    for (const responsibility of ['Production owner', 'Source/input', 'Acceptance']) {
      expect(ledger).toContain(responsibility);
    }
    expect(ledger).toMatch(/no business claims (?:in this MVP )?are verified/i);
    expect(ledger).toMatch(/does not (?:send|deliver).*(?:email|CRM)/i);
  });

  test('wires a generated-output verifier into every production build', () => {
    const packageJson = source('package.json');
    expect(packageJson).toContain('tests/verify-built-mvp.ts');
    expect(existsSync(join(root, 'tests/verify-built-mvp.ts'))).toBe(true);
  });
});
