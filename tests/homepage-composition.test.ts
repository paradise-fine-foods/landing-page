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

    expect(layout).not.toMatch(/DemoNotice|demoNotice/);
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
    expect(hero).toContain('shouldDisposePage(event)');
    expect(hero).not.toMatch(/addEventListener\('pagehide',[\s\S]{0,240}\{ once: true \}/);
  });

  test('the localized homepage consumes CMS queries and a central locale counterpart', () => {
    const page = source('src/pages/[locale]/index.astro');

    expect(page).toContain('getGlobalSettings');
    expect(page).toContain('getFeaturedContent');
    expect(page).toContain('getCategories');
    expect(page).toContain('getProducts');
    expect(page).toContain('getBrands');
    expect(page).toContain('counterpartLocale');
    expect(page).toContain("import LivingHero from '../../components/sections/LivingHero.astro'");
    expect(page).toContain('<LivingHero');
    expect(page).not.toMatch(/ProductStage|modelSrc|slot="stage"/);
    expect(page).not.toMatch(/locale\s*===|locale\s*!==/);
    expect(page).toContain('carousel={copy.home.carousel}');
    const hero = source('src/components/sections/LivingHero.astro');
    expect(hero).toContain("import('../../lib/motion/reveal')");
    expect(hero).toContain("import('../../lib/carousel/controller')");
  });

  test('derives hero preloads from the same CMS image rendered by the hero', () => {
    const page = source('src/pages/[locale]/index.astro');
    expect(page).not.toMatch(/import\s+livingHeroProductSrc\s+from/);
    expect(page).not.toContain('assets/demo/living-hero-product.svg');
    expect(page).toContain("const preloadImages = [{ href: featured.hero.image.src");
    expect(page).toContain('{preloadImages}');
    expect(page).toContain('image={featured.hero.image.src}');
  });

  test('limits reveals to selected authored section elements and provides settled reduced motion', () => {
    const sections = [
      'CategoryDiscovery.astro', 'FeaturedProducts.astro', 'FeaturedBrands.astro',
      'ServiceProof.astro', 'ChannelPathways.astro', 'CredibilityStrip.astro', 'FinalCta.astro',
    ].map((file) => source(`src/components/sections/${file}`)).join('\n');
    const hooks = sections.match(/<[^>]+data-reveal(?:[\s>])/g) ?? [];
    expect(hooks.length).toBeGreaterThanOrEqual(7);
    expect(hooks.length).toBeLessThanOrEqual(18);
    expect(sections).toContain(':global([data-motion-enhanced]) [data-reveal]');
    expect(sections).toContain("[data-reveal][data-revealed='true']");
    expect(sections).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(sections).toMatch(/opacity:\s*1/);
    expect(sections).toMatch(/transform:\s*none/);
    expect(sections).toMatch(/transition:\s*none/);
  });
});
