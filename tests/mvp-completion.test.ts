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
  });

  test('keeps the browser checklist on the generated Vietnamese brand route', () => {
    const plan = source('docs/superpowers/plans/2026-07-16-finefoods-client-review-mvp.md');
    expect(plan).toContain('/vi/brands/nha-sua-maison/');
    expect(plan).not.toContain('/vi/brands/nha-sua-mau/');
  });

  test('wires generated-output and production-copy verifiers into the project', () => {
    const packageJson = source('package.json');
    expect(packageJson).toContain('tests/verify-built-mvp.ts');
    expect(packageJson).toContain('tests/verify-built-living-design.ts');
    expect(packageJson).toContain('tests/verify-built-route-manifest.ts');
    expect(existsSync(join(root, 'tests/verify-built-mvp.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/verify-built-living-design.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/verify-built-route-manifest.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/production-copy.test.ts'))).toBe(true);
  });
});
