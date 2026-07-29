import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('production completion contracts', () => {
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
    expect(page).toContain('<FloatingFormRail locale="en" contactPath="/en/contact/" customerPath="/en/contact/customer/" supplierPath="/en/contact/supplier/" copy={ui.en.floatingRail} staticOnly />');
    expect(page).not.toMatch(/Astro\.redirect|navigator\.language|<script/);
    expect(page).toContain('<title>Page not found | Paradise Fine Foods</title>');
    expect(page).not.toMatch(/<title>[^<]*[À-ỹĐđ]/u);
    for (const phrase of ['Chuyển đến nội dung', 'Tiếng Việt', 'Nguyên liệu tuyển chọn']) {
      expect(page).toContain(`<span lang="vi">${phrase}</span>`);
    }
    expect(page).not.toMatch(/\b(?:demo|fictional|review-only|client[- ]review|pending|waiting|approval)\b|bản (?:demo|mẫu)|hư cấu|chỉ (?:dùng )?để duyệt/i);
    expect(page).toContain('.not-found__link');
    expect(page.match(/class="[^"]*not-found__link/g)).toHaveLength(5);
    expect(page).toContain('min-block-size: 2.75rem');
    expect(page).toContain('.not-found__art { align-items: center; background: var(--color-cold-paper); border: 1px solid var(--color-brushed-steel);');
    expect(page).toContain('.not-found__art strong { color: var(--color-graphite);');
    expect(page).not.toContain('OrganicMark');
    expect(page).not.toContain('var(--color-paradise-orange)');
  });

  test('keeps the browser checklist on the generated Vietnamese brand route', () => {
    const plan = source('docs/superpowers/plans/2026-07-16-finefoods-client-review-mvp.md');
    expect(plan).toContain('/vi/brands/nha-sua-maison/');
    expect(plan).not.toContain('/vi/brands/nha-sua-mau/');
  });

  test('runs production contracts in the test suite without static-output build verifiers', () => {
    const packageJson = source('package.json');
    expect(packageJson).toContain('"build": "astro build"');
    expect(packageJson).toContain('"test": "bun test"');
    expect(packageJson).not.toContain('tests/verify-built-mvp.ts');
    expect(existsSync(join(root, 'tests/verify-built-mvp.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/verify-built-living-design.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/verify-built-route-manifest.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/production-copy.test.ts'))).toBe(true);
  });

  test('verifies the generated 404 against the restrained product-led recovery stage', () => {
    const verifier = source('tests/verify-built-mvp.ts');

    expect(verifier).toContain('generated recovery stage is missing its neutral boundary');
    expect(verifier).toContain('generated 404 stage must not restore decorative artwork');
    expect(verifier).not.toContain('not-found__drop');
    expect(verifier).not.toContain('not-found__petal');
  });

  test('binds standalone recovery headings separately to the approved H1 and H2 scales', () => {
    const page = source('src/pages/404.astro');
    const tokens = source('src/styles/tokens.css');

    expect(page).toContain('.not-found__content h1 { font-size: var(--text-h1);');
    expect(page).toContain('.not-found__content h2 { font-size: var(--text-h2);');
    expect(page).not.toContain('.not-found__content h1, .not-found__content h2 { font-size: clamp(');
    expect(tokens).toContain('--text-h1: clamp(2.25rem, 5vw, 4.25rem)');
    expect(tokens).toContain('--text-h2: clamp(1.75rem, 3vw, 2.75rem)');
  });
});
