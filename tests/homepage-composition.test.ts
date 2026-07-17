import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const source = (path: string) => readFileSync(join(root, path), 'utf8');

describe('homepage composition', () => {
  test('lets Astro i18n own the root redirect', () => {
    const rootPage = source('src/pages/index.astro');

    expect(existsSync(join(root, 'src/pages/index.astro'))).toBe(true);
    expect(rootPage).not.toContain('Astro.redirect');
    expect(existsSync(join(root, 'src/middleware.ts'))).toBe(false);
  });

  test('site layout composes the shared shell around one main landmark', () => {
    const layout = source('src/layouts/SiteLayout.astro');

    expect(layout).toContain("import DemoNotice from '../components/global/DemoNotice.astro'");
    expect(layout).toContain("import Header from '../components/global/Header.astro'");
    expect(layout).toContain("import Footer from '../components/global/Footer.astro'");
    expect(layout).toContain('<main id="main-content">');
  });

  test('living hero server-renders its image, actions, caption, and decorative canvas', () => {
    const hero = source('src/components/sections/LivingHero.astro');

    expect(hero).toContain('interface Props');
    expect(hero).toContain('product.image.alt');
    expect(hero).toContain('width={product.image.width}');
    expect(hero).toContain('height={product.image.height}');
    expect(hero).toContain('living-hero__actions');
    expect(hero).toContain('<figcaption>{product.name}</figcaption>');
    expect(hero).toContain('data-living-canvas');
    expect(hero).toContain('aria-hidden="true"');
    expect(hero).not.toMatch(/slot name="stage"|ProductStage|modelSrc/);
  });

  test('both localized homepages consume CMS queries and fixed route counterparts', () => {
    for (const locale of ['en', 'vi']) {
      const page = source(`src/pages/${locale}/index.astro`);

      expect(page).toContain('getGlobalSettings');
      expect(page).toContain('getFeaturedContent');
      expect(page).toContain('getCategories');
      expect(page).toContain('getProducts');
      expect(page).toContain('getBrands');
      expect(page).toContain('counterpartPath');
      expect(page).toContain("import LivingHero from '../../components/sections/LivingHero.astro'");
      expect(page).toContain('<LivingHero');
      expect(page).not.toMatch(/ProductStage|modelSrc|slot="stage"/);
      expect(page).not.toMatch(/locale\s*===|locale\s*!==/);
    }
  });
});
