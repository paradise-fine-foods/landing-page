import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
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

const stringsBelow = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsBelow);
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringsBelow);
  return [];
};

const nonProductionCopy = /\b(?:demo|fictional|review-only|client[- ]review|stakeholder review|representative|approval|approved|pending|waiting)\b|bản (?:demo|mẫu)|hư cấu|chỉ (?:dùng )?để duyệt|duyệt thiết kế|nội dung mẫu|sản phẩm mẫu|minh họa/i;

describe('production-facing copy', () => {
  test('contains no demo, review, approval, or placeholder indicators', () => {
    const publicCopy = stringsBelow({
      ui,
      categories: demoCategories.map(({ name, description, image }) => ({ name, description, alt: image.alt })),
      brands: demoBrands.map(({ name, description, origin, image }) => ({ name, description, origin, alt: image.alt })),
      products: demoProducts.map(({ slug, name, description, origin, packFormat, storage, benefits, image }) => ({ slug, name, description, origin, packFormat, storage, benefits, alt: image.alt })),
      settings: demoGlobalSettings,
      featured: {
        hero: { ...demoFeaturedContent.hero, image: demoFeaturedContent.hero.image.alt },
        editorial: { ...demoFeaturedContent.editorial, image: demoFeaturedContent.editorial.image.alt },
      },
    });

    expect(publicCopy.filter((value) => nonProductionCopy.test(value))).toEqual([]);
  });

  test('does not render dedicated demo or review notices', () => {
    expect(source('src/layouts/SiteLayout.astro')).not.toMatch(/DemoNotice|demoNotice/);
    expect(source('src/components/brands/BrandDetail.astro')).not.toMatch(/brand-detail__notice|demoNotice/);
    expect(source('src/components/forms/EnquiryForm.astro')).not.toMatch(/enquiry__demo-note|demoDelivery/);
  });

  test('uses production identity on the standalone 404 page and canonical origin', () => {
    expect(source('astro.config.mjs')).toContain("site: 'https://paradisefinefoods.com'");
    expect(source('src/pages/404.astro')).not.toMatch(nonProductionCopy);
    expect(source('src/pages/404.astro')).not.toContain('demo.paradisefinefoods.com');
  });
});
