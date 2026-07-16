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

  test('hero reserves a named product stage and keeps actions outside it', () => {
    const hero = source('src/components/sections/Hero.astro');
    const slotPosition = hero.indexOf('<slot name="stage"');
    const actionsPosition = hero.indexOf('hero__actions');

    expect(slotPosition).toBeGreaterThan(-1);
    expect(actionsPosition).toBeGreaterThan(-1);
    expect(actionsPosition).toBeLessThan(slotPosition);
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
      expect(page).not.toMatch(/locale\s*===|locale\s*!==/);
    }
  });
});
